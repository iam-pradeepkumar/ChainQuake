from fastapi import APIRouter
import datetime, random

router = APIRouter()

alert_store = []

def generate_initial_alerts():
    templates = [
        {"severity": "critical", "message": "Chennai Port congestion detected — export delays expected", "company": "W01"},
        {"severity": "high", "message": "Supplier S06 in Hosur reports machinery failure", "company": "S06"},
        {"severity": "medium", "message": "Power fluctuations reported in Coimbatore industrial zone", "company": "S03"},
        {"severity": "low", "message": "Minor logistics delay on NH44 corridor", "company": "W05"},
        {"severity": "high", "message": "Raw material price spike affecting textile sector", "company": "S08"},
        {"severity": "medium", "message": "Workforce shortage at Tiruvottiyur manufacturing unit", "company": "M03"},
    ]
    for i, t in enumerate(templates):
        alert_store.append({
            "id": i + 1, "severity": t["severity"], "message": t["message"],
            "company_id": t["company"],
            "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=random.randint(1, 120))).isoformat(),
            "acknowledged": False
        })

generate_initial_alerts()

@router.get("")
async def get_alerts():
    return sorted(alert_store, key=lambda x: x["timestamp"], reverse=True)

def add_alert(severity, message, company_id=""):
    alert_store.append({
        "id": len(alert_store) + 1, "severity": severity, "message": message,
        "company_id": company_id,
        "timestamp": datetime.datetime.now().isoformat(), "acknowledged": False
    })
