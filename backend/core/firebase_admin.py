import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import json
from backend.core.config import settings

# Initialize Firebase Admin
# In production, use the service account JSON file
# For local dev, you can use the environment variable GOOGLE_APPLICATION_CREDENTIALS
def init_firebase():
    try:
        # Check if already initialized
        firebase_admin.get_app()
        return firestore.client()
    except ValueError:
        pass

    try:
        cert_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        # Try file path first
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
            print(f"🔥 FIREBASE ADMIN: Initialized from file: {cert_path}")
        else:
            # Try parsing FIREBASE_SERVICE_ACCOUNT as JSON string (for env var secret)
            cert_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if cert_json:
                try:
                    cert_data = json.loads(cert_json)
                    cred = credentials.Certificate(cert_data)
                    firebase_admin.initialize_app(cred)
                    print("🔥 FIREBASE ADMIN: Initialized from JSON env var.")
                except json.JSONDecodeError:
                    print("🔥 FIREBASE ADMIN: Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON.")
                    firebase_admin.initialize_app()
            else:
                # Fallback for simplified testing
                firebase_admin.initialize_app()
                print("🔥 FIREBASE ADMIN: Initialized with default credentials.")
        
        db = firestore.client()
        _seed_if_empty(db)
        return db
    except Exception as e:
        print(f"🔥 FIREBASE ADMIN ERROR: Failed to initialize. Check FIREBASE_SERVICE_ACCOUNT_PATH secret file! Error: {e}")
        return None


def _seed_if_empty(db):
    """Auto-seed Firestore collections if they're empty (first deployment)"""
    try:
        # Check if nodes collection exists
        nodes = list(db.collection('nodes').limit(1).stream())
        if len(nodes) == 0:
            print("🔥 FIREBASE: No data found. Auto-seeding Firestore...")
            from backend.core.seed_data import COMPANIES, DEPENDENCIES
            
            # Seed Nodes
            for c in COMPANIES:
                db.collection('nodes').document(c["id"]).set({
                    "name": c["name"],
                    "type": c["type"],
                    "city": c["city"],
                    "lat": c["lat"],
                    "lng": c["lng"],
                    "base_risk": c["base_risk"],
                    "current_risk": c["base_risk"],
                    "status": "operational",
                    "sector": c["sector"]
                })
            
            # Seed Edges
            for idx, (source, target, strength) in enumerate(DEPENDENCIES):
                db.collection('edges').document(f"edge_{idx}").set({
                    "source": source,
                    "target": target,
                    "latency": strength * 20
                })
            
            print(f"🔥 FIREBASE: Seeded {len(COMPANIES)} nodes and {len(DEPENDENCIES)} edges.")
        else:
            print("🔥 FIREBASE: Data already present in Firestore.")
    except Exception as e:
        print(f"🔥 FIREBASE: Auto-seed check failed: {e}")


db_firestore = init_firebase()

async def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Firebase Token Verification Error: {e}")
        return None
