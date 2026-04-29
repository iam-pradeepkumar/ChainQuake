import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from backend.core.seed_data import COMPANIES, DEPENDENCIES

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
def init_firebase():
    try:
        app = firebase_admin.get_app()
    except ValueError:
        cert_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
    return firestore.client()

def seed_firestore():
    db = init_firebase()
    print("FIRESTORE: Seeding mission-critical intelligence...")
    
    # Seed Nodes
    nodes_ref = db.collection('nodes')
    for c in COMPANIES:
        nodes_ref.document(c["id"]).set({
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
    edges_ref = db.collection('edges')
    for idx, (source, target, strength) in enumerate(DEPENDENCIES):
        edges_ref.document(f"edge_{idx}").set({
            "source": source,
            "target": target,
            "latency": strength * 20
        })
    
    print("FIRESTORE: Synchronization complete. Data persistent in Cloud.")

if __name__ == "__main__":
    seed_firestore()
