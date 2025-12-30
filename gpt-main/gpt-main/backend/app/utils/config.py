"""
backend/app/utils/config.py
Enhanced Configuration for OPEX Manager
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    # Environment
    NODE_ENV: str = os.getenv("NODE_ENV", "development")
    
    # Server
    PORT: int = 3000
    HOST: str = "0.0.0.0"
    
    # Database
    # We will use an absolute path to ensure no ambiguity on Windows
    DB_PATH: Path = BASE_DIR / "backend" / "opex.db"
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "opex-admin-secret-key-2024")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Paths
    LOG_DIR: Path = BASE_DIR / "backend" / "logs"
    UPLOAD_DIR: Path = BASE_DIR / "backend" / "uploads"
    
    # App Specific
    DEFAULT_FY: str = "FY2024"
    
    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()

# Ensure directories exist
settings.LOG_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
