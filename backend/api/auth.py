"""
Auth API - Firebase Authentication with Firestore User Persistence
"""
from fastapi import APIRouter, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


def _get_firestore_client():
    """Lazy import to avoid circular dependency"""
    from backend.core.firebase_admin import db_firestore
    return db_firestore


def _save_user_to_firestore(uid: str, user_data: dict):
    """Save or update user document in Firestore 'users' collection"""
    db = _get_firestore_client()
    if db is None:
        print("AUTH: Firestore client is None, cannot save user.")
        return False
    try:
        user_ref = db.collection('users').document(uid)
        existing = user_ref.get()
        if existing.exists:
            # Update last login
            user_ref.update({
                "last_login": datetime.utcnow().isoformat(),
                "login_count": (existing.to_dict().get("login_count", 0)) + 1
            })
            print(f"AUTH: Updated existing user {uid} in Firestore.")
        else:
            # Create new user document
            user_ref.set({
                **user_data,
                "created_at": datetime.utcnow().isoformat(),
                "last_login": datetime.utcnow().isoformat(),
                "login_count": 1,
                "role": "operator",
                "status": "active"
            })
            print(f"AUTH: Created new user {uid} in Firestore.")
        return True
    except Exception as e:
        print(f"AUTH: Failed to save user to Firestore: {e}")
        return False


@router.post("/register")
def register(user_data: UserRegister):
    """Register a new user via email/password and persist to Firestore"""
    from backend.core.firebase_admin import db_firestore
    
    uid = user_data.email.replace("@", "_at_").replace(".", "_")
    
    user_doc = {
        "uid": uid,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "provider": "email",
        "photoURL": None
    }
    
    saved = _save_user_to_firestore(uid, user_doc)
    
    return {
        "access_token": "firebase-handles-this",
        "token_type": "bearer",
        "user": {"email": user_data.email, "full_name": user_data.full_name, "uid": uid},
        "persisted": saved
    }


@router.post("/login")
def login(user_data: UserLogin):
    """Login an existing user and update their last_login in Firestore"""
    uid = user_data.email.replace("@", "_at_").replace(".", "_")
    
    user_doc = {
        "uid": uid,
        "email": user_data.email,
        "full_name": "ChainQuake Operator",
        "provider": "email",
        "photoURL": None
    }
    
    saved = _save_user_to_firestore(uid, user_doc)
    
    return {
        "access_token": "firebase-handles-this",
        "token_type": "bearer",
        "user": {"email": user_data.email, "full_name": "ChainQuake Operator", "uid": uid},
        "persisted": saved
    }


@router.post("/google")
async def google_auth(authorization: Optional[str] = Header(None)):
    """Verify Google Firebase ID token and persist user to Firestore"""
    from backend.core.firebase_admin import verify_firebase_token
    
    if not authorization:
        return {"error": "No authorization token provided", "persisted": False}
    
    # Extract token from "Bearer <token>" header
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    decoded = await verify_firebase_token(token)
    if not decoded:
        return {"error": "Invalid or expired Firebase token", "persisted": False}
    
    uid = decoded.get("uid", "unknown")
    user_doc = {
        "uid": uid,
        "email": decoded.get("email", ""),
        "full_name": decoded.get("name", decoded.get("email", "").split("@")[0]),
        "provider": "google",
        "photoURL": decoded.get("picture", None)
    }
    
    saved = _save_user_to_firestore(uid, user_doc)
    
    return {
        "user": user_doc,
        "persisted": saved
    }


@router.get("/users")
def get_all_users():
    """Get all users from Firestore (admin/debug endpoint)"""
    db = _get_firestore_client()
    if db is None:
        return {"error": "Firestore not available", "users": []}
    try:
        users_ref = db.collection('users').stream()
        users = []
        for doc in users_ref:
            u = doc.to_dict()
            u["id"] = doc.id
            users.append(u)
        return {"users": users, "count": len(users)}
    except Exception as e:
        return {"error": str(e), "users": []}
