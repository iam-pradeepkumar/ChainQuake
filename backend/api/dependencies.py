from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_dependencies():
    from backend.services.graph_engine import graph_engine
    return graph_engine.get_all_edges()
