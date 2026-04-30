"""
Simulation API - Trigger and manage network disruption events
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger("ChainQuake.Simulation")

class SimulationRequest(BaseModel):
    event_type: Optional[str] = None
    location: Optional[str] = "Chennai"
    custom_event: Optional[str] = None
    notify_email: Optional[str] = None
    notify_phone: Optional[str] = None

def _dispatch_notifications(notify_email, notify_phone, event_name, affected_nodes):
    """Background task for multi-source alerting"""
    from backend.services.notification_service import notification_service
    
    logger.info(f"🚀 MISSION DISPATCH: Processing alerts for {event_name}")
    
    critical_count = sum(1 for n in affected_nodes if n['status'] == 'critical')
    msg = f"CHAINQUAKE ALERT: {event_name}. {critical_count} nodes critical, {len(affected_nodes)} total affected nodes."
    
    if notify_email:
        res = notification_service.send_email_alert(
            to_email=notify_email,
            subject=f"DISRUPTION: {event_name}",
            body=msg,
            alert_data={"severity": "critical"}
        )
        logger.info(f"📡 EMAIL DISPATCH RESULT: {'SUCCESS' if res else 'FAILED'}")
    
    if notify_phone:
        res = notification_service.make_phone_call(
            to_phone=notify_phone,
            message=msg,
            alert_data={"severity": "critical"}
        )
        logger.info(f"📞 VOICE DISPATCH RESULT: {'SUCCESS' if res else 'FAILED'}")

@router.post("")
async def run_simulation(req: SimulationRequest, background_tasks: BackgroundTasks):
    from backend.services.graph_engine import graph_engine
    from backend.services.simulation_engine import simulation_engine
    from backend.api.alerts import add_alert

    logger.info(f"🛠️ SIMULATION START: {req.event_type or req.custom_event}")
    
    result = simulation_engine.run_disruption(
        graph_engine, 
        event_type=req.event_type, 
        location=req.location,
        custom_event=req.custom_event
    )
    
    affected_nodes = result.get("affected_nodes", [])
    
    # 1. Update Alert Store
    for node in affected_nodes:
        severity = "critical" if node["status"] == "critical" else "high"
        add_alert(severity, f"SIMULATION: {node['name']} impacted", node["id"])

    # 2. Trigger Notifications (Aggressive)
    if affected_nodes or req.custom_event:
        background_tasks.add_task(
            _dispatch_notifications, 
            req.notify_email, 
            req.notify_phone, 
            result['event'], 
            affected_nodes
        )

    # 3. WebSocket Broadcast
    from backend.main import manager
    await manager.broadcast({"type": "REFRESH_ALL"})
    
    return result

@router.post("/reset")
async def reset_simulation():
    from backend.services.graph_engine import graph_engine
    from backend.main import manager
    
    graph_engine.reset_risks()
    await manager.broadcast({"type": "REFRESH_ALL"})
    return {"status": "reset", "health": graph_engine.get_health()}

@router.post("/test_notify")
async def test_notification(req: SimulationRequest, background_tasks: BackgroundTasks):
    """Manual gateway test"""
    logger.info(f"🧪 MANUAL TEST DISPATCH: Target {req.notify_email}")
    
    # Mock data for test
    affected = [{"id": "test", "name": "SYSTEM GATEWAY", "status": "critical"}]
    
    background_tasks.add_task(
        _dispatch_notifications, 
        req.notify_email, 
        req.notify_phone, 
        "MANUAL SYSTEM TEST", 
        affected
    )
    return {"status": "dispatched"}
