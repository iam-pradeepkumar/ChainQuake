from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SimulationRequest(BaseModel):
    event_type: Optional[str] = None
    location: Optional[str] = None
    custom_event: Optional[str] = None
    notify_email: Optional[str] = None
    notify_phone: Optional[str] = None

def _dispatch_notifications(notify_email, notify_phone, event_name, affected_nodes):
    print(f"🚀 MISSION DISPATCH STARTED: Processing alerts for {event_name}...")
    from backend.services.notification_service import notification_service
    
    # Calculate summary
    critical_count = sum(1 for n in affected_nodes if n['status'] == 'critical')
    msg = f"CRITICAL DISRUPTION: {event_name}. {critical_count} nodes critical, {len(affected_nodes)} total affected."
    
    if notify_email:
        print(f"📡 DISPATCHING EMAIL to {notify_email}...")
        notification_service.send_email_alert(
            to_email=notify_email,
            subject=f"DISRUPTION: {event_name}",
            body=msg,
            alert_data={"severity": "critical", "company_id": affected_nodes[0]['name']}
        )
    
    if notify_phone:
        print(f"📞 DISPATCHING AI VOICE CALL to {notify_phone}...")
        notification_service.make_phone_call(
            to_phone=notify_phone,
            message=msg,
            alert_data={"severity": "critical"}
        )
    print("✅ MISSION DISPATCH COMPLETED.")

@router.post("")
async def run_simulation(req: SimulationRequest, background_tasks: BackgroundTasks):
    from backend.services.graph_engine import graph_engine
    from backend.services.simulation_engine import simulation_engine
    from backend.api.alerts import add_alert

    # 1. Run core simulation logic (In-memory)
    result = simulation_engine.run_disruption(
        graph_engine, event_type=req.event_type,
        location=req.location, custom_event=req.custom_event
    )
    
    affected_nodes = result.get("affected_nodes", [])
    
    # 2. Add alerts to store (In-memory)
    for node in affected_nodes:
        if node["status"] == "critical":
            add_alert("critical", f"SIMULATION: {node['name']} risk at {node['risk_score']*100:.0f}%", node["id"])
        elif node["status"] == "at_risk":
            add_alert("high", f"SIMULATION: {node['name']} showing elevated risk", node["id"])

    # 3. Aggressive Notification Trigger
    # Fire if there's any disruption OR if it's a custom event
    if affected_nodes or req.custom_event:
        print(f"!!! ALERT TRIGGERED !!! Nodes affected: {len(affected_nodes)}. Sending to: {req.notify_email} / {req.notify_phone}")
        background_tasks.add_task(
            _dispatch_notifications, 
            req.notify_email, 
            req.notify_phone, 
            result['event'], 
            affected_nodes
        )
    else:
        print("SIMULATION: No nodes affected. Skipping automatic notifications.")

    # 4. Broadcast update (WS)
    from backend.main import manager
    await manager.broadcast({"type": "SIMULATION_UPDATE", "event": req.event_type})

    # Return result immediately!
    return result

@router.post("/reset")
async def reset_simulation(background_tasks: BackgroundTasks):
    from backend.services.graph_engine import graph_engine
    from backend.main import manager
    
    # Reset in-memory immediately
    graph_engine.reset_risks()
    
    # Notify clients
    await manager.broadcast({"type": "REFRESH_ALL"})
    
    return {"status": "reset", "health": graph_engine.get_health()}

@router.post("/test_notify")
async def test_notification(req: SimulationRequest, background_tasks: BackgroundTasks):
    """Direct endpoint to test notifications without a simulation"""
    from backend.services.graph_engine import graph_engine
    
    mock_node = list(graph_engine.graph.nodes(data=True))[0]
    affected = [{"id": mock_node[0], "name": mock_node[1].get('name', 'TEST ASSET'), "status": "critical"}]
    
    print(f"DEBUG: Manual Test Dispatch initiated to {req.notify_email}")
    
    background_tasks.add_task(
        _dispatch_notifications, 
        req.notify_email, 
        req.notify_phone, 
        "MANUAL SYSTEM TEST", 
        affected
    )
    return {"status": "dispatched", "target": req.notify_email}
