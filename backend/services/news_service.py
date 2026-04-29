"""
News Service - Real-Time Supply Chain Intelligence from Live RSS Feeds & News APIs
Fetches real news from multiple sources, no dummy/mock data.
"""
import requests
import datetime
import random
import hashlib
from backend.core.config import settings


# Supply chain focused RSS feed URLs
RSS_FEEDS = [
    "https://www.supplychaindive.com/feeds/news/",
    "https://feeds.feedburner.com/LogisticsViewpoints",
    "https://www.freightwaves.com/news/rss",
]

# GNews API (free tier: 100 req/day, no credit card)
GNEWS_BASE = "https://gnews.io/api/v4/search"

# Fallback: GDELT real-time supply chain event URLs
GDELT_API = "https://api.gdeltproject.org/api/v2/doc/doc"


class NewsService:
    def __init__(self):
        self.gnews_key = settings.GNEWS_API_KEY
        self.newsapi_key = settings.NEWS_API_KEY
        self.cache = []
        self.last_fetch = None
        self.cache_ttl = 180  # 3 minutes

    def fetch_real_time_news(self):
        """Main entry: fetch live news from multiple real sources"""
        # Cache check
        if self.last_fetch and (datetime.datetime.now() - self.last_fetch).seconds < self.cache_ttl:
            if self.cache:
                return self.cache

        all_news = []

        # Strategy 1: GNews API (best free option — 100 req/day, real articles)
        gnews = self._fetch_gnews()
        if gnews:
            all_news.extend(gnews)

        # Strategy 2: NewsAPI.org (if key provided)
        if not all_news:
            newsapi = self._fetch_newsapi()
            if newsapi:
                all_news.extend(newsapi)

        # Strategy 3: GDELT Project (always free, no key needed)
        if len(all_news) < 4:
            gdelt = self._fetch_gdelt()
            if gdelt:
                all_news.extend(gdelt)

        # Strategy 4: RSS Feeds (feedparser, always free)
        if len(all_news) < 4:
            rss = self._fetch_rss()
            if rss:
                all_news.extend(rss)

        # Deduplicate by title hash
        seen = set()
        unique = []
        for item in all_news:
            key = hashlib.md5(item["title"].encode()).hexdigest()[:12]
            if key not in seen:
                seen.add(key)
                unique.append(item)

        # Sort by recency and limit
        result = unique[:12]

        if result:
            self.cache = result
            self.last_fetch = datetime.datetime.now()

        return result if result else self._get_minimal_fallback()

    def _fetch_gnews(self):
        """Fetch from GNews.io (free tier: 100 req/day)"""
        if not self.gnews_key or self.gnews_key == "demo":
            return []

        try:
            queries = [
                "supply chain disruption",
                "logistics crisis shipping",
                "port congestion global trade",
                "manufacturing shutdown"
            ]
            params = {
                "q": random.choice(queries),
                "lang": "en",
                "max": 8,
                "apikey": self.gnews_key,
                "sortby": "publishedAt"
            }
            resp = requests.get(GNEWS_BASE, params=params, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", [])
                return [
                    {
                        "id": hashlib.md5(a["url"].encode()).hexdigest()[:10],
                        "title": a.get("title", ""),
                        "description": a.get("description", ""),
                        "source": a.get("source", {}).get("name", "Global Intel"),
                        "impact": self._calculate_impact(a.get("title", "")),
                        "time": self._relative_time(a.get("publishedAt", "")),
                        "category": self._categorize(a.get("title", "")),
                        "url": a.get("url", "#"),
                        "image": a.get("image", None),
                        "live": True
                    }
                    for a in articles if a.get("title")
                ]
        except Exception as e:
            print(f"NEWS: GNews fetch error: {e}")
        return []

    def _fetch_newsapi(self):
        """Fetch from NewsAPI.org"""
        if not self.newsapi_key or self.newsapi_key == "demo":
            return []

        try:
            queries = ["supply chain disruption", "port congestion", "industrial strike", "logistics crisis"]
            params = {
                "q": random.choice(queries),
                "apiKey": self.newsapi_key,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 8
            }
            resp = requests.get("https://newsapi.org/v2/everything", params=params, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                return [
                    {
                        "id": hashlib.md5(a["url"].encode()).hexdigest()[:10],
                        "title": a.get("title", ""),
                        "description": a.get("description", ""),
                        "source": a.get("source", {}).get("name", "News Wire"),
                        "impact": self._calculate_impact(a.get("title", "")),
                        "time": self._relative_time(a.get("publishedAt", "")),
                        "category": self._categorize(a.get("title", "")),
                        "url": a.get("url", "#"),
                        "image": a.get("urlToImage", None),
                        "live": True
                    }
                    for a in data.get("articles", []) if a.get("title")
                ]
        except Exception as e:
            print(f"NEWS: NewsAPI fetch error: {e}")
        return []

    def _fetch_gdelt(self):
        """Fetch from GDELT Project (free, no API key needed)"""
        try:
            params = {
                "query": "supply chain OR logistics OR shipping disruption",
                "mode": "artlist",
                "maxrecords": 8,
                "format": "json",
                "sort": "datedesc"
            }
            resp = requests.get(GDELT_API, params=params, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", [])
                return [
                    {
                        "id": hashlib.md5(a.get("url", str(i)).encode()).hexdigest()[:10],
                        "title": a.get("title", ""),
                        "description": "",
                        "source": a.get("domain", "GDELT Intelligence"),
                        "impact": self._calculate_impact(a.get("title", "")),
                        "time": self._relative_time(a.get("seendate", "")),
                        "category": self._categorize(a.get("title", "")),
                        "url": a.get("url", "#"),
                        "image": a.get("socialimage", None),
                        "live": True
                    }
                    for i, a in enumerate(articles) if a.get("title")
                ]
        except Exception as e:
            print(f"NEWS: GDELT fetch error: {e}")
        return []

    def _fetch_rss(self):
        """Fetch from RSS feeds using feedparser"""
        results = []
        try:
            import feedparser
        except ImportError:
            print("NEWS: feedparser not installed. Skipping RSS.")
            return []

        for feed_url in RSS_FEEDS[:2]:  # Limit to avoid timeout
            try:
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:4]:
                    results.append({
                        "id": hashlib.md5(entry.get("link", "").encode()).hexdigest()[:10],
                        "title": entry.get("title", ""),
                        "description": entry.get("summary", "")[:200],
                        "source": feed.feed.get("title", "RSS Feed"),
                        "impact": self._calculate_impact(entry.get("title", "")),
                        "time": self._relative_time(entry.get("published", "")),
                        "category": self._categorize(entry.get("title", "")),
                        "url": entry.get("link", "#"),
                        "image": None,
                        "live": True
                    })
            except Exception as e:
                print(f"NEWS: RSS parse error ({feed_url}): {e}")

        return results

    def _get_minimal_fallback(self):
        """Absolute last resort: if ALL APIs fail, return a status message (not fake news)"""
        return [{
            "id": "system-status",
            "title": "⚠ Live feed sources temporarily unavailable. Configure GNEWS_API_KEY for real-time intelligence.",
            "description": "All news API sources are currently unreachable. Please check your API keys in the environment configuration.",
            "source": "System",
            "impact": "Low",
            "time": "Just now",
            "category": "System Status",
            "url": "#",
            "image": None,
            "live": False
        }]

    def _calculate_impact(self, title):
        """Determine impact level from headline content"""
        t = title.lower()
        high_words = ["strike", "shutdown", "crisis", "critical", "crash", "stopped", "collapse",
                       "disruption", "blockade", "flood", "cyclone", "earthquake", "war", "sanctions"]
        medium_words = ["delay", "shortage", "surge", "issue", "problem", "concern", "warning",
                         "slowdown", "backlog", "congestion", "risk"]

        if any(word in t for word in high_words):
            return "High"
        if any(word in t for word in medium_words):
            return "Medium"
        return "Low"

    def _categorize(self, title):
        """Auto-categorize news based on content"""
        t = title.lower()
        categories = {
            "Maritime": ["port", "shipping", "vessel", "container", "maritime", "dock", "freight"],
            "Manufacturing": ["factory", "manufacturing", "production", "plant", "assembly"],
            "Logistics": ["logistics", "transport", "trucking", "delivery", "route", "warehouse"],
            "Weather": ["cyclone", "flood", "storm", "earthquake", "drought", "weather"],
            "Labor": ["strike", "union", "labor", "workers", "wage", "workforce"],
            "Cyber": ["cyber", "hack", "ransomware", "security", "breach"],
            "Trade Policy": ["tariff", "sanctions", "trade war", "regulation", "policy"],
            "Commodities": ["oil", "steel", "commodity", "price", "raw material"],
        }
        for cat, keywords in categories.items():
            if any(kw in t for kw in keywords):
                return cat
        return "Global Intel"

    def _relative_time(self, timestamp_str):
        """Convert ISO timestamp to relative time string"""
        if not timestamp_str:
            return "Recent"
        try:
            # Handle various date formats
            for fmt in ["%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y%m%dT%H%M%S"]:
                try:
                    dt = datetime.datetime.strptime(timestamp_str[:20], fmt[:20])
                    break
                except ValueError:
                    continue
            else:
                return "Recent"

            diff = datetime.datetime.utcnow() - dt
            minutes = int(diff.total_seconds() / 60)

            if minutes < 1:
                return "Just now"
            if minutes < 60:
                return f"{minutes}m ago"
            if minutes < 1440:
                return f"{minutes // 60}h ago"
            return f"{minutes // 1440}d ago"
        except:
            return "Recent"


news_service = NewsService()
