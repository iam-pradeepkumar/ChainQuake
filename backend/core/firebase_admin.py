import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
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
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback for simplified testing or if project_id is enough
            firebase_admin.initialize_app()
        return firestore.client()
    except Exception as e:
        print(f"🔥 FIREBASE ADMIN ERROR: Failed to initialize. Check FIREBASE_SERVICE_ACCOUNT_PATH secret file! Error: {e}")
        return None

db_firestore = init_firebase()

async def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Firebase Token Verification Error: {e}")
        return None
