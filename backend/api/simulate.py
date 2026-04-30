from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SimulationRequest(BaseModel):
    event_type: Optional[str] = None
    location: Optional[str] = None
    custom_event: Optional[str] = None
    notify_email: Optional[str] = None
    notify_phone: Optional[str] = None

@router.post("")
async def run_simulation(req: SimulationRequest):
    from backend.services.graph_engine import graph_engine
    from backend.services.simulation_engine import simulation_engine
    from backend.api.alerts import add_alert

    result = simulation_engine.run_disruption(
        graph_engine, event_type=req.event_type,
        location=req.location, custom_event=req.custom_event
    )
    
    critical_nodes = [n for n in result.get("affected_nodes", []) if n["status"] == "critical"]
    
    # Generate alerts for critical nodes
    for node in result.get("affected_nodes", []):
        if node["status"] == "critical":
            add_alert("critical", f"SIMULATION: {node['name']} risk at {node['risk_score']*100:.0f}%", node["id"])
        elif node["status"] == "at_risk":
            add_alert("high", f"SIMULATION: {node['name']} showing elevated risk", node["id"])

    # AUTOMATIC NOTIFICATIONS
    if critical_nodes:
        from backend.services.notification_service import notification_service
        msg = f"CRITICAL DISRUPTION: {result['event']}. {len(critical_nodes)} nodes are in critical status. Most affected: {critical_nodes[0]['name']}."
        
        if req.notify_email:
            notification_service.send_email_alert(
                to_email=req.notify_email,
                subject=f"CRITICAL: {result['event']}",
                body=msg,
                alert_data={"severity": "critical", "company_id": critical_nodes[0]['name']}
            )
        
        if req.notify_phone:
            notification_service.make_phone_call(
                to_phone=req.notify_phone,
                message=msg,
                alert_data={"severity": "critical"}
            )

    # Get recovery plan
    recovery = simulation_engine.get_recovery_plan(graph_engine, result.get("affected_nodes", []))
    result["recovery_plan"] = recovery
    # Broadcast to all tactical terminals
    from backend.main import manager
    await manager.broadcast({"type": "SIMULATION_UPDATE", "event": req.event_type})

    return result

@router.post("/reset")
async def reset_simulation():
    from backend.services.graph_engine import graph_engine
    from backend.main import manager
    graph_engine.reset_risks()
    await manager.broadcast({"type": "REFRESH_ALL"})
    return {"status": "reset", "health": graph_engine.get_health()}
