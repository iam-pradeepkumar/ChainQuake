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
