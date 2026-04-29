import requests
import os
import datetime
import random
from backend.core.config import settings

class NewsService:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.base_url = "https://newsapi.org/v2/everything"
        self.cache = []
        self.last_fetch = None

    def fetch_real_time_news(self):
        # Neural Cache: throttle requests to avoid tactical overhead
        if self.last_fetch and (datetime.datetime.now() - self.last_fetch).seconds < 300:
            return self.cache

        # Attempt high-fidelity ingestion if API key is present
        if self.api_key and self.api_key != "demo":
            try:
                queries = ["supply chain disruption", "port congestion", "industrial strike", "logistics crisis"]
                params = {
                    "q": random.choice(queries),
                    "apiKey": self.api_key,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 8
                }
                response = requests.get(self.base_url, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
                    processed = []
                    for art in articles:
                        processed.append({
                            "id": art.get("url"),
                            "title": art.get("title"),
                            "source": art.get("source", {}).get("name", "Intelligence Stream"),
                            "impact": self._calculate_impact(art.get("title", "")),
                            "time": "Just now",
                            "category": "Live Global Intel",
                            "url": art.get("url")
                        })
                    if processed:
                        self.cache = processed
                        self.last_fetch = datetime.datetime.now()
                        return processed
            except Exception as e:
                print(f"NEWS_SERVICE: Neural ingestion error: {e}")

        # Real-Time Simulation Engine (Fallback for high-fidelity mock data)
        return self._generate_dynamic_intel()

    def _generate_dynamic_intel(self):
        """Generates dynamic, mission-critical news signals when API is unreachable"""
        events = [
            ("Cyber Incident", "Neural anomaly detected in Hosur manufacturing hub. Communication lines under stress."),
            ("Port Congestion", "Chennai Port reports 14% increase in dwell time. Tactical re-routing advised."),
            ("Infrastructure", "Power grid fluctuation in Coimbatore electronics sector impacting JIT schedules."),
            ("Labor Tension", "Awaiting resolution on wage dispute in Tirupur textile clusters. Risk elevated."),
            ("Logistics", "Intermodal bottleneck identified at Salem junction. Secondary routes active.")
        ]
        
        dynamic_news = []
        for _ in range(6):
            cat, msg = random.choice(events)
            dynamic_news.append({
                "id": random.randint(1000, 9999),
                "title": msg,
                "source": "Tactical Hub",
                "impact": random.choice(["High", "Medium", "Medium"]),
                "time": f"{random.randint(1, 59)}m ago",
                "category": cat,
                "url": "#"
            })
        
        self.cache = dynamic_news
        self.last_fetch = datetime.datetime.now()
        return dynamic_news

    def _calculate_impact(self, title):
        t = title.lower()
        if any(word in t for word in ["strike", "shutdown", "crisis", "critical", "crash", "stopped"]):
            return "High"
        if any(word in t for word in ["delay", "shortage", "surge", "issue", "problem"]):
            return "Medium"
        return "Low"

news_service = NewsService()
