"""
Alerts API - Real-Time Alert System with Email & Phone Call Notifications
Alerts are generated from live simulation data and persisted to Firestore.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter()

# In-memory alert store (synced from simulations + live events)
alert_store = []


class EmailAlertRequest(BaseModel):
    to_email: str
    alert_id: Optional[int] = None
    subject: Optional[str] = None
    custom_message: Optional[str] = None


class PhoneAlertRequest(BaseModel):
    to_phone: str
    alert_id: Optional[int] = None
    custom_message: Optional[str] = None


def _generate_live_alerts():
    """Generate initial alerts from actual graph health data"""
    global alert_store
    try:
        from backend.services.graph_engine import graph_engine
        nodes = graph_engine.get_all_nodes()
        alert_store = []

        alert_id = 1
        for node in nodes:
            risk = node.get("current_risk", node.get("base_risk", 0))
            status = node.get("status", "operational")

            if status == "critical" or risk >= 0.7:
                alert_store.append({
                    "id": alert_id,
                    "severity": "critical",
                    "message": f"CRITICAL: {node['name']} in {node.get('city', 'Unknown')} — Risk at {risk*100:.0f}%. Immediate action required.",
                    "company_id": node["id"],
                    "company_name": node["name"],
                    "city": node.get("city", ""),
                    "risk_score": risk,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "acknowledged": False,
                    "notified_email": False,
                    "notified_phone": False
                })
                alert_id += 1
            elif status == "at_risk" or risk >= 0.4:
                alert_store.append({
                    "id": alert_id,
                    "severity": "high",
                    "message": f"ELEVATED: {node['name']} ({node.get('sector', '')}) showing elevated risk — {risk*100:.0f}%",
                    "company_id": node["id"],
                    "company_name": node["name"],
                    "city": node.get("city", ""),
                    "risk_score": risk,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "acknowledged": False,
                    "notified_email": False,
                    "notified_phone": False
                })
                alert_id += 1
            elif risk >= 0.15:
                alert_store.append({
                    "id": alert_id,
                    "severity": "medium",
                    "message": f"MONITORING: {node['name']} baseline risk at {risk*100:.0f}% — within normal thresholds",
                    "company_id": node["id"],
                    "company_name": node["name"],
                    "city": node.get("city", ""),
                    "risk_score": risk,
                    "timestamp": datetime.datetime.now().isoformat(),
                    "acknowledged": False,
                    "notified_email": False,
                    "notified_phone": False
                })
                alert_id += 1

    except Exception as e:
        print(f"ALERTS: Failed to generate live alerts: {e}")


# Generate on module load
_generate_live_alerts()


@router.get("")
async def get_alerts():
    """Get all active alerts sorted by severity and timestamp"""
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    return sorted(
        alert_store,
        key=lambda x: (severity_order.get(x["severity"], 4), x["timestamp"]),
        reverse=False
    )


@router.get("/refresh")
async def refresh_alerts():
    """Regenerate alerts from current graph state"""
    _generate_live_alerts()
    return {"status": "refreshed", "count": len(alert_store)}


@router.post("/notify/email")
async def send_email_notification(req: EmailAlertRequest):
    """Send an alert via email"""
    from backend.services.notification_service import notification_service

    # Find the specific alert or build a custom one
    alert_data = None
    subject = req.subject or "Supply Chain Alert"
    body = req.custom_message or ""

    if req.alert_id:
        alert_data = next((a for a in alert_store if a["id"] == req.alert_id), None)
        if alert_data:
            subject = f"{alert_data['severity'].upper()}: {alert_data.get('company_name', 'Network')} Alert"
            body = alert_data["message"]
            # Mark as email-notified
            alert_data["notified_email"] = True

    if not body:
        # Send a summary of all critical/high alerts
        critical_alerts = [a for a in alert_store if a["severity"] in ("critical", "high")]
        if critical_alerts:
            subject = f"ChainQuake: {len(critical_alerts)} Active Threat(s)"
            body = "\n\n".join([f"[{a['severity'].upper()}] {a['message']}" for a in critical_alerts[:5]])
        else:
            subject = "ChainQuake: Network Status Report"
            body = f"All systems operational. {len(alert_store)} nodes monitored."

    result = notification_service.send_email_alert(
        to_email=req.to_email,
        subject=subject,
        body=body,
        alert_data=alert_data
    )
    return result


@router.post("/notify/phone")
async def send_phone_notification(req: PhoneAlertRequest):
    """Trigger an automated phone call alert"""
    from backend.services.notification_service import notification_service

    alert_data = None
    message = req.custom_message or ""

    if req.alert_id:
        alert_data = next((a for a in alert_store if a["id"] == req.alert_id), None)
        if alert_data:
            message = alert_data["message"]
            alert_data["notified_phone"] = True

    if not message:
        critical_alerts = [a for a in alert_store if a["severity"] in ("critical", "high")]
        if critical_alerts:
            message = f"You have {len(critical_alerts)} active threats. Most critical: {critical_alerts[0]['message']}"
        else:
            message = "All supply chain systems are currently operational. No critical alerts detected."

    result = notification_service.make_phone_call(
        to_phone=req.to_phone,
        message=message,
        alert_data=alert_data
    )
    return result


@router.get("/notify/status")
async def get_notification_status():
    """Get notification system configuration status"""
    from backend.services.notification_service import notification_service
    return {
        "config": notification_service.get_config_status(),
        "history": notification_service.get_history()[:20]
    }


def add_alert(severity, message, company_id=""):
    """Add a new alert (called by simulation engine)"""
    alert_store.append({
        "id": len(alert_store) + 1,
        "severity": severity,
        "message": message,
        "company_id": company_id,
        "company_name": company_id,
        "city": "",
        "risk_score": 0,
        "timestamp": datetime.datetime.now().isoformat(),
        "acknowledged": False,
        "notified_email": False,
        "notified_phone": False
    })
