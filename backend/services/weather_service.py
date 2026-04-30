"""
Weather Intelligence Service - Real-time weather monitoring for supply chain hubs.
Uses Open-Meteo (No API key required) for live environmental disruption alerts.
"""
import requests
import datetime

class WeatherService:
    def __init__(self):
        # Coordinates for key Tamil Nadu hubs
        self.hubs = {
            "Chennai": {"lat": 13.0827, "lon": 80.2707},
            "Coimbatore": {"lat": 11.0168, "lon": 76.9558},
            "Madurai": {"lat": 9.9252, "lon": 78.1198},
            "Tuticorin": {"lat": 8.7139, "lon": 78.1348}, # Major Port
            "Salem": {"lat": 11.6643, "lon": 78.1460}
        }

    def fetch_weather_disruptions(self):
        """Fetch live weather data and identify potential disruptions"""
        disruptions = []
        try:
            for city, coords in self.hubs.items():
                url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current_weather=true&hourly=precipitation"
                resp = requests.get(url, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    current = data.get("current_weather", {})
                    temp = current.get("temperature")
                    wind = current.get("windspeed")
                    code = current.get("weathercode")
                    
                    # Weather Codes: 95, 96, 99 are thunderstorms. 65, 67, 82 are heavy rain.
                    if code in [95, 96, 99]:
                        disruptions.append({
                            "id": f"weather-{city}-{datetime.datetime.now().strftime('%H%M')}",
                            "title": f"⛈️ THUNDERSTORM ALERT: {city} Operations Impacted",
                            "description": f"Severe weather detected in {city}. Wind speeds at {wind}km/h. Logistics delays expected.",
                            "source": "Meteo Intelligence",
                            "impact": "High",
                            "time": "Just now",
                            "category": "Weather",
                            "url": "#",
                            "live": True
                        })
                    elif code in [61, 63, 65, 80, 81, 82]:
                        disruptions.append({
                            "id": f"weather-{city}-{datetime.datetime.now().strftime('%H%M')}",
                            "title": f"🌧️ HEAVY RAIN: Port Congestion in {city}",
                            "description": f"Sustained precipitation in {city} region. Last-mile delivery and loading schedules delayed by 2-4 hours.",
                            "source": "Meteo Intelligence",
                            "impact": "Medium",
                            "time": "Recent",
                            "category": "Weather",
                            "url": "#",
                            "live": True
                        })
                    elif wind > 40:
                         disruptions.append({
                            "id": f"weather-{city}-wind",
                            "title": f"🚩 HIGH WIND WARNING: {city} Logistics Hub",
                            "description": f"Dangerous wind speeds ({wind}km/h) detected. Crane operations at {city} facilities may be suspended.",
                            "source": "Meteo Intelligence",
                            "impact": "High",
                            "time": "Just now",
                            "category": "Weather",
                            "url": "#",
                            "live": True
                        })
        except Exception as e:
            print(f"WEATHER: Failed to fetch data: {e}")
            
        return disruptions

weather_service = WeatherService()
