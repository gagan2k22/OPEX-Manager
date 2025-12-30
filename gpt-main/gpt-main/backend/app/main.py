"""
backend/app/main.py
Optimized FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from app.database import engine, Base
from app.routers import auth, budgets, reports, master, ui, audit, users, imports
from app.utils.config import settings
from app.utils.logger import logger
import os

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OPEX Manager", 
    version="3.0.0",
    description="Unified High-Performance OPEX Management System"
)

# Setup Templates
templates = Jinja2Templates(directory="app/templates")

# Compression Optimization
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security & CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    max_age=3600
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# UI Routes (Registered first for routing priority)
app.include_router(ui.router, tags=["UI"])

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(master.router, prefix="/api/master", tags=["master"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(imports.router, prefix="/api", tags=["imports"])

@app.get("/api/health")
async def health():
    return {
        "status": "ok", 
        "version": "3.0.0", 
        "db": "connected",
        "environment": settings.NODE_ENV
    }
