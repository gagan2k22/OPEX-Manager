"""
Audit Router
backend/app/routers/audit.py
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.schemas import ActivityLog, AuditLog, ServiceMaster, FYFinancials, User
from app.utils.security import require_admin, get_current_user

router = APIRouter()

@router.get("/activity")
async def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all activity logs (Admin only)"""
    logs = db.query(ActivityLog).options(joinedload(ActivityLog.user)).order_by(ActivityLog.timestamp.desc()).limit(1000).all()
    
    # Transform for frontend if needed, or rely on ORM serialization (Pydantic is better)
    # Using simple return for now, FastAPI handles serialization
    return logs

@router.get("/audit")
async def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all data audit logs (Admin only)"""
    logs = db.query(AuditLog).options(joinedload(AuditLog.user)).order_by(AuditLog.timestamp.desc()).limit(1000).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "createdAt": log.timestamp,
            "user": {"name": log.user.name if log.user else "Unknown"},
            "action": "UPDATE", # Audit logs are updates usually
            "entityType": log.table_name,
            "entityId": log.record_id,
            "field": log.field_name,
            "oldValue": log.old_value,
            "newValue": log.new_value,
            "comment": f"Changed {log.field_name}: {log.old_value} -> {log.new_value}"
        })
    return result

@router.post("/restore/{log_id}")
async def restore_audit_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Restore a value from an audit log (Admin only)"""
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    
    # Determine model
    if log.table_name == "service_master":
        model = ServiceMaster
    elif log.table_name == "fy_financials":
        model = FYFinancials
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported table: {log.table_name}")
        
    # Find record
    record = db.query(model).filter(model.id == log.record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Target record no longer exists")
        
    # Restore value
    if not hasattr(record, log.field_name):
         raise HTTPException(status_code=400, detail=f"Field {log.field_name} does not exist on model")
    
    # Convert value back to type?
    # Simplified: Assuming strings work for SetAttr (SQLAlchemy often coerces) or basic types.
    # ideally we check type. But for now, let's try direct set.
    current_val = getattr(record, log.field_name)
    
    # Type casting (simple)
    target_val = log.old_value
    try:
        # If original field is float/int, we might need cast
        if isinstance(current_val, (int, float)) and log.old_value is not None:
             target_val = type(current_val)(log.old_value)
    except:
        pass # Fallback to string
        
    setattr(record, log.field_name, target_val)
    
    # Log this restoration
    activity = ActivityLog(
        user_id=current_user.id,
        action="RESTORE_DATA",
        details=f"Restored {log.table_name} ID {log.record_id} field {log.field_name} to {log.old_value}"
    )
    db.add(activity)
    
    db.commit()
    return {"status": "success", "message": "Data restored successfully"}
