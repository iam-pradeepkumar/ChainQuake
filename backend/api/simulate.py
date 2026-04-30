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

def _dispatch_notifications(notify_email, notify_phone, event_name, critical_nodes):
    from backend.services.notification_service import notification_service
    msg = f"CRITICAL DISRUPTION: {event_name}. {len(critical_nodes)} nodes are in critical status. Most affected: {critical_nodes[0]['name']}."
    
    if notify_email:
        notification_service.send_email_alert(
            to_email=notify_email,
            subject=f"CRITICAL: {event_name}",
            body=msg,
            alert_data={"severity": "critical", "company_id": critical_nodes[0]['name']}
        )
    
    if notify_phone:
        notification_service.make_phone_call(
            to_phone=notify_phone,
            message=msg,
            alert_data={"severity": "critical"}
        )

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
    
    critical_nodes = [n for n in result.get("affected_nodes", []) if n["status"] == "critical"]
    
    # 2. Add alerts to store (In-memory)
    for node in result.get("affected_nodes", []):
        if node["status"] == "critical":
            add_alert("critical", f"SIMULATION: {node['name']} risk at {node['risk_score']*100:.0f}%", node["id"])
        elif node["status"] == "at_risk":
            add_alert("high", f"SIMULATION: {node['name']} showing elevated risk", node["id"])

    # 3. Queue Notifications and DB Persistence as Background Tasks
    if critical_nodes and (req.notify_email or req.notify_phone):
        background_tasks.add_task(
            _dispatch_notifications, 
            req.notify_email, 
            req.notify_phone, 
            result['event'], 
            critical_nodes
        )

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
