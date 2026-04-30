"""
ChainQuake - Autonomous Supply Chain Intelligence Platform
Main FastAPI Application - Production Ready v1.2.0
"""
import os
import json
import asyncio
import logging
import sys
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.api import companies, dependencies, alerts, risk, simulate, news, chat, auth

# Production Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger("ChainQuake")

app = FastAPI(
    title="ChainQuake API", 
    version="1.2.0", 
    description="Autonomous Intelligence & Real-Time Orchestration"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Tasks
@app.on_event("startup")
async def startup_event():
    logger.info("⚡ CHAINQUAKE CORE: System operational. Initializing Neural Link...")
    
    # Subtle Health Heartbeat
    async def heartbeat():
        while True:
            await asyncio.sleep(300) # Every 5 minutes
            logger.info("💓 HEARTBEAT: Neural Link Active. All sectors nominal.")
    
    asyncio.create_task(heartbeat())

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/intelligence")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# API Routes
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(dependencies.router, prefix="/api/dependencies", tags=["Dependencies"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk"])
app.include_router(simulate.router, prefix="/api/simulate", tags=["Simulation"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/api/health")
async def health():
    from backend.services.graph_engine import graph_engine
    return {"status": "healthy", "network": graph_engine.get_health()}

# Static File Serving
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs"):
            return JSONResponse({"error": "Resource not found"}, 404)
        
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index)
else:
    @app.get("/")
    async def root():
        return {"message": "ChainQuake API active. Build frontend for UI."}
