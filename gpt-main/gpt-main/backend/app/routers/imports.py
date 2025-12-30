from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.schemas import ImportLog, User
from app.utils.security import get_current_user

router = APIRouter()

class ImportLogResponse(BaseModel):
    id: int
    createdAt: datetime
    type: str
    filename: str
    user: dict | None
    totalRows: int
    acceptedRows: int
    rejectedRows: int
    status: str

    class Config:
        from_attributes = True

@router.get("/import-history")
async def get_import_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all import history logs"""
    logs = db.query(ImportLog).order_by(ImportLog.created_at.desc()).all()
    
    result = []
    for log in logs:
        # User info
        user_info = None
        if log.user:
            user_info = {"id": log.user.id, "name": log.user.name}
            
        result.append({
            "id": log.id,
            "createdAt": log.created_at,
            "type": log.type,
            "filename": log.filename,
            "user": user_info,
            "totalRows": log.total_rows,
            "acceptedRows": log.accepted_rows,
            "rejectedRows": log.rejected_rows,
            "status": log.status
        })
    
    return result
