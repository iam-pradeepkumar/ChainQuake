from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_news():
    from backend.services.news_service import news_service
    return news_service.fetch_real_time_news()
