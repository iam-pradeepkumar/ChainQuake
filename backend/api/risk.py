from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_risk_data():
    from backend.services.graph_engine import graph_engine
    from backend.services.ai_engine import ai_engine
    health = graph_engine.get_health()
    insights = ai_engine.generate_insights(health)
    return {
        "graph": graph_engine.get_graph_data(),
        "health": health,
        "insights": insights
    }

@router.get("/graph")
async def get_graph():
    from backend.services.graph_engine import graph_engine
    return graph_engine.get_graph_data()

@router.post("/reseed")
async def reseed_database():
    from backend.core.firebase_admin import db_firestore
    from backend.core.seed_data import COMPANIES, DEPENDENCIES
    from backend.services.graph_engine import graph_engine
    
    # 1. Clear existing
    nodes = db_firestore.collection('nodes').stream()
    for doc in nodes: doc.reference.delete()
    
    edges = db_firestore.collection('edges').stream()
    for doc in edges: doc.reference.delete()
    
    # 2. Seed Nodes
    for c in COMPANIES:
        db_firestore.collection('nodes').document(c["id"]).set({
            "name": c["name"],
            "type": c["type"],
            "city": c["city"],
            "lat": c["lat"],
            "lng": c["lng"],
            "base_risk": c["base_risk"],
            "current_risk": c["base_risk"],
            "status": "operational",
            "sector": c["sector"],
            "description": c.get("description", "")
        })
    
    # 3. Seed Edges
    for idx, (source, target, strength) in enumerate(DEPENDENCIES):
        db_firestore.collection('edges').document(f"edge_{idx}").set({
            "source": source,
            "target": target,
            "latency": strength * 20
        })
    
    # 4. Sync graph engine
    graph_engine.sync_with_db()
    
    return {"status": "success", "message": f"Re-seeded {len(COMPANIES)} nodes and {len(DEPENDENCIES)} edges with real data."}
