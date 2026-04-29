from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user_data: UserRegister):
    return {
        "access_token": "firebase-handles-this",
        "token_type": "bearer",
        "user": {"email": user_data.email, "full_name": user_data.full_name}
    }

@router.post("/login")
def login(user_data: UserLogin):
    return {
        "access_token": "firebase-handles-this",
        "token_type": "bearer",
        "user": {"email": user_data.email, "full_name": "Firebase User"}
    }
