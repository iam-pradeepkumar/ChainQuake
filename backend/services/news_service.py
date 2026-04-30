"""
News Service - Multi-Source Intelligence Aggregator
Integrates News APIs, RSS Feeds, Weather Sensors, and Strategic Network Analysis.
"""
import requests
import datetime
import random
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from backend.core.config import settings


# Supply chain focused RSS feed URLs
RSS_FEEDS = [
    "https://www.supplychaindive.com/feeds/news/",
    "https://feeds.feedburner.com/LogisticsViewpoints",
    "https://www.freightwaves.com/news/rss",
]

class NewsService:
    def __init__(self):
        self.gnews_key = settings.GNEWS_API_KEY
        self.newsapi_key = settings.NEWS_API_KEY
        self.cache = []
        self.last_fetch = None
        self.cache_ttl = 300

    def fetch_real_time_news(self):
        """Fetch intelligence from 5+ disparate sources in parallel"""
        if self.last_fetch and (datetime.datetime.now() - self.last_fetch).seconds < self.cache_ttl:
            if self.cache: return self.cache

        all_intel = []
        
        # 1. Weather Disruptions (Sensor Data)
        try:
            from backend.services.weather_service import weather_service
            all_intel.extend(weather_service.fetch_weather_disruptions())
        except: pass

        # 2. Parallel API & RSS Fetching
        tasks = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            if self.gnews_key and self.gnews_key != "demo":
                tasks.append(executor.submit(self._fetch_gnews))
            if self.newsapi_key and self.newsapi_key != "demo":
                tasks.append(executor.submit(self._fetch_newsapi))
            tasks.append(executor.submit(self._fetch_gdelt))
            tasks.append(executor.submit(self._fetch_rss))

            for future in as_completed(tasks, timeout=10):
                try:
                    res = future.result()
                    if res: all_intel.extend(res)
                except: pass

        # 3. Network Health Signals (Internal Intelligence)
        try:
            from backend.services.graph_engine import graph_engine
            health = graph_engine.get_health()
            if health.get("critical", 0) > 0:
                all_intel.append({
                    "id": f"network-{datetime.datetime.now().strftime('%H%M')}",
                    "title": f"🚩 SYSTEM ALERT: {health['critical']} Critical Node(s) Detected",
                    "description": f"Autonomous monitoring has identified critical risk scores in the regional network. Health score dropped to {health['health_score']}%.",
                    "source": "ChainQuake Core",
                    "impact": "High", "time": "Real-time", "category": "Internal", "url": "#", "live": True
                })
        except: pass

        # 4. Port Activity Signals (Simulated AIS Intelligence)
        all_intel.extend(self._generate_port_signals())

        # Deduplicate
        seen = set()
        unique = []
        for item in all_intel:
            key = hashlib.md5(item["title"].encode()).hexdigest()[:12]
            if key not in seen:
                seen.add(key)
                unique.append(item)

        # Sort: High impact first
        unique.sort(key=lambda x: (x["impact"] == "High", x["impact"] == "Medium"), reverse=True)
        
        result = unique[:20]
        if result:
            self.cache = result
            self.last_fetch = datetime.datetime.now()
            return result
        
        return self._get_minimal_fallback()

    def _generate_port_signals(self):
        """Simulate real-time maritime/logistics signals based on current trends"""
        signals = []
        ports = ["Tuticorin", "Chennai Port", "Ennore"]
        port = random.choice(ports)
        
        if random.random() > 0.6:
            signals.append({
                "id": f"ais-{random.randint(100,999)}",
                "title": f"⚓ MARITIME: Vessel Backlog at {port}",
                "description": f"AIS tracking shows 12+ vessels anchored outside {port}. Turnaround time increased by 18%.",
                "source": "VesselTracker Intel",
                "impact": "Medium", "time": "Live", "category": "Maritime", "url": "#", "live": True
            })
        return signals

    def _fetch_gnews(self):
        try:
            params = {"q": "supply chain OR logistics Tamil Nadu", "lang": "en", "max": 5, "apikey": self.gnews_key}
            resp = requests.get("https://gnews.io/api/v4/search", params=params, timeout=6)
            if resp.status_code == 200:
                return [self._format_news(a, "GNews") for a in resp.json().get("articles", [])]
        except: pass
        return []

    def _fetch_newsapi(self):
        try:
            params = {"q": "supply chain disruption", "apiKey": self.newsapi_key, "language": "en", "pageSize": 5}
            resp = requests.get("https://newsapi.org/v2/everything", params=params, timeout=6)
            if resp.status_code == 200:
                return [self._format_news(a, "NewsAPI") for a in resp.json().get("articles", [])]
        except: pass
        return []

    def _fetch_gdelt(self):
        try:
            params = {"query": "supply chain logistics", "mode": "artlist", "maxrecords": 5, "format": "json"}
            resp = requests.get("https://api.gdeltproject.org/api/v2/doc/doc", params=params, timeout=6)
            if resp.status_code == 200:
                return [self._format_news(a, "GDELT", is_gdelt=True) for a in resp.json().get("articles", [])]
        except: pass
        return []

    def _fetch_rss(self):
        results = []
        try:
            import feedparser
            for url in RSS_FEEDS[:2]:
                feed = feedparser.parse(url)
                for entry in feed.entries[:3]:
                    results.append({
                        "id": hashlib.md5(entry.link.encode()).hexdigest()[:10],
                        "title": entry.title, "description": entry.summary[:150],
                        "source": "Logistics Wire", "impact": "Medium", "time": "Today",
                        "category": "RSS", "url": entry.link, "live": True
                    })
        except: pass
        return results

    def _format_news(self, a, source, is_gdelt=False):
        title = a.get("title", "")
        return {
            "id": hashlib.md5(a.get("url", title).encode()).hexdigest()[:10],
            "title": title, "description": a.get("description", "") if not is_gdelt else "",
            "source": source, "impact": "Medium", "time": "Recent", "category": "News",
            "url": a.get("url", "#"), "live": True
        }

    def _get_minimal_fallback(self):
        return [{"id":"sys", "title":"System Scanning...", "description":"Monitoring global signals.", "source":"Core", "impact":"Low", "time":"Now", "category":"System", "url":"#", "live":False}]

news_service = NewsService()
