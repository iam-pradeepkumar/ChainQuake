# 🛰️ ChainQuake: Autonomous Supply Chain Intelligence

[![Production Build](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=render)](https://chainquake-96ni.onrender.com)
[![Backend](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://reactjs.org)
[![Intelligence](https://img.shields.io/badge/Neural-Engine-blueviolet?style=for-the-badge&logo=brainjs)](https://github.com/iam-pradeepkumar/ChainQuake)

> **"Predicting the Unpredictable. Stabilizing the Global Pulse."**

ChainQuake is a mission-critical, autonomous intelligence platform designed to neutralize supply chain disruptions before they cascade. By integrating real-time weather sensors, global news signals, and neural graph mapping, ChainQuake provides a sub-second "Tactical Heartbeat" for enterprise logistics.

---

## 🚀 Key Mission Capabilities

### 🧠 Neural Graph Mapping
Visualize your entire supply network as a live, interactive neural graph. ChainQuake uses advanced **cascading risk algorithms** to predict how a failure in one node (e.g., a supplier in Chennai) will impact downstream warehouses and manufacturers.

### 📡 Multi-Source Intelligence Ingestion
The platform continuously polls global tactical feeds:
- **Open-Meteo**: Live weather sensor integration for strategic hubs.
- **NewsAPI & GNews**: Real-time disruption signal aggregation.
- **AIS Simulation**: Maritime port congestion and vessel backlog signals.

### 📞 Autonomous AI Voice Dispatch
When a critical disruption is detected, ChainQuake's **Vapi.ai integration** initiates an outbound AI voice call to operators, delivering a verbal intelligence briefing and mitigation plan in seconds.

### 📧 Resend-Backed Alerts
Bypass legacy SMTP restrictions with high-fidelity, HTTP-based email reports delivered via the **Resend API**, ensuring 100% deliverability of mission-critical alerts.

---

## 🏗️ The Tactical Stack

| Layer | Technology |
| :--- | :--- |
| **Orchestration** | Python 3.14 + FastAPI (Asynchronous Core) |
| **Intelligence HUD** | React 18 + Vite + Framer Motion |
| **Geospatial** | Leaflet.js + Google Satellite Imagery |
| **Persistence** | Firebase Cloud Firestore (NoSQL) |
| **Authentication** | Firebase Auth + Google OAuth 2.0 |
| **Notifications** | Vapi.ai (Voice) & Resend (Email/HTTP) |

---

## 🛠️ Quick Start (Operator Field Guide)

### Prerequisites
- Python 3.x
- Node.js & npm
- Firebase Service Account JSON

### 1. Backend Initialization
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Configuration
Ensure your `.env` contains the mission-critical keys:
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `VAPI_API_KEY`
- `RESEND_API_KEY`
- `NEWS_API_KEY`

---

## 🛰️ Operational Flow
1. **Initialize**: Authenticate via the **Tactical Gate**.
2. **Monitor**: Observe live geospatial telemetry on the **Obsidian Dashboard**.
3. **Stress Test**: Trigger disruption vectors (Cyclone, Cyber Attack) via the **Crisis Simulator**.
4. **Neutralize**: Receive automated AI briefings and execute mitigation plans.

---

## 🤝 Contribution & Intelligence Sharing
Developed for the **TU x NIAT Hackathon**.
Built with ❤️ by **Team Peaky Blinders**.

> **"ChainQuake: Because the future of resilience isn't human-led. It's AI-stabilized."**
