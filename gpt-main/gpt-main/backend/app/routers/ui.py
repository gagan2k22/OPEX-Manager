from fastapi import APIRouter, Request, Depends, Form, HTTPException, Response
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
import bcrypt
from datetime import datetime, timedelta
from jose import jwt

from app.database import get_db
from app.models.schemas import User
from app.utils.config import settings
from app.utils.logger import logger

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

@router.get("/", response_class=HTMLResponse)
async def root(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    return RedirectResponse(url="/dashboard")

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        # Return a small fragment with an error message
        return HTMLResponse(
            content='<div class="text-sm text-red-500 text-center animate-pulse">Invalid email or password</div>',
            status_code=200
        )
    
    # Successful login
    roles = [role.name for role in user.roles]
    token = create_access_token({"id": user.id, "email": user.email, "roles": roles})
    
    # Redirect to dashboard with cookie
    response = RedirectResponse(url="/dashboard", status_code=303)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax"
    )
    
    # HX-Redirect header tells HTMX to do a full page redirect
    response.headers["HX-Redirect"] = "/dashboard"
    
    return response

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    # Authorization check
    token = request.cookies.get("access_token")
    if not token:
        return RedirectResponse(url="/login")
    
    return templates.TemplateResponse("dashboard.html", {"request": request})

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("access_token")
    return response
