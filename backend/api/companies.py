from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_companies():
    from backend.services.graph_engine import graph_engine
    return graph_engine.get_all_nodes()

@router.get("/{company_id}")
async def get_company(company_id: str):
    from backend.services.graph_engine import graph_engine
    node = graph_engine.get_node(company_id)
    if not node:
        return {"error": "Company not found"}
    return node
