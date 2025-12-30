"""
backend/app/routers/budgets.py
Budget management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional
import csv
import io
import pandas as pd

from app.database import get_db
from app.models.schemas import ServiceMaster, FYFinancials, Allocation, BOARow, BOAValue, ImportLog, ActivityLog, AuditLog, User
from app.services.excel_import import ExcelService
from app.utils.config import settings
from app.utils.validations import BudgetUpdate, BudgetCreate
from app.utils.logger import logger
from app.utils.input_validation import BudgetSearchRequest, FileUploadValidator
from app.utils.security import require_admin, get_current_user
from app.utils.security import get_current_user
import json
from datetime import datetime

router = APIRouter()

@router.get("/tracker")
async def get_tracker(
    db: Session = Depends(get_db),
    page: int = Query(0, ge=0),
    pageSize: int = Query(100, ge=1, le=10000),
    search: str = Query("", max_length=100),
    fy: str = Query(settings.DEFAULT_FY, pattern=r"^FY\d{4}$")
):
    """Get budget tracker data with validation and optimized queries"""
    
    # Sanitize search input to prevent SQL injection
    if search:
        # Remove dangerous SQL characters
        import re
        # Escape LIKE wildcards to prevent injection
        search = search.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        # Remove dangerous characters and limit length
        search = re.sub(r'[;\'"--]', '', search).strip()[:100]
    
    # Use eager loading to prevent N+1 queries
    query = db.query(ServiceMaster).options(
        joinedload(ServiceMaster.financials)
    )
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                ServiceMaster.uid.ilike(search_term),
                ServiceMaster.vendor.ilike(search_term),
                ServiceMaster.service.ilike(search_term)
            )
        )
    
    total = query.count()
    services = query.offset(page * pageSize).limit(pageSize).all()
    
    rows = []
    for s in services:
        financial = next((f for f in s.financials if f.fy == fy), None)
        budget_val = financial.budget if financial else 0
        actual_val = financial.actuals if financial else 0
        
        rows.append({
            "id": s.id,
            "uid": s.uid,
            "parent_uid": s.parent_uid,
            "vendor": s.vendor,
            "service": s.service, 
            "description": s.description,
            "service_start_date": s.start_date,
            "service_end_date": s.end_date,
            "renewal_month": s.renewal_month,
            "budget_head": s.budget_head,
            "tower": s.tower,
            "contract": s.contract,
            "po_entity": s.po_entity,
            "allocation_basis": s.allocation_basis,
            "initiative_type": s.initiative_type,
            "service_type": s.service_type,
            "currency": s.currency,
            "fy_budget": budget_val,
            "fy_actuals": actual_val,
            "variance": budget_val - actual_val,
            "remarks": s.remarks,
            "value_in_lac": (budget_val / 100000) if budget_val else 0
        })
        
    return {
        "rows": rows,
        "totalCount": total
    }

@router.post("/import")
async def import_budgets(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    fy: str = settings.DEFAULT_FY,
    current_user: User = Depends(get_current_user)
):
    """Import budget data from Excel file with validation"""
    
    # Validate file
    is_valid, error_msg = FileUploadValidator.validate_excel_file(
        file.filename, 
        file.size if hasattr(file, 'size') else 0
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    content = await file.read()
    stats = ExcelService.process_budget_import(db, content, fy)
    
    # Create Import Log
    import_log = ImportLog(
        type="BUDGET",
        filename=file.filename,
        user_id=current_user.id,
        total_rows=stats.get("total", 0),
        accepted_rows=stats.get("success", 0),
        rejected_rows=stats.get("failed", 0),
        status="Completed" if stats.get("failed", 0) == 0 else "Partial",
        error_details=f"Success: {stats.get('success', 0)}, Failed: {stats.get('failed', 0)}"
    )
    db.add(import_log)
    
    # Activity Log
    activity = ActivityLog(
        user_id=current_user.id,
        action="IMPORT_BUDGET",
        details=f"Imported budget file: {file.filename}. Stats: {stats}"
    )
    db.add(activity)
    
    db.commit()
    return {"status": "success", "details": stats}

@router.post("/xls")
async def import_budgets_xls(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    fy: str = settings.DEFAULT_FY,
    current_user: User = Depends(get_current_user)
):
    # This matches the frontend call to /api/imports/xls if prefixed with /api/imports
    content = await file.read()
    stats = ExcelService.process_budget_import(db, content, fy)
    
    # Import Log
    import_log = ImportLog(
        type="BUDGET_XLS",
        filename=file.filename,
        user_id=current_user.id,
        total_rows=stats.get("total", 0),
        accepted_rows=stats.get("success", 0),
        rejected_rows=stats.get("failed", 0),
        status="Completed",
        error_details=f"Via XLS endpoint. Stats: {stats}"
    )
    db.add(import_log)
    
    # Activity Log
    activity = ActivityLog(
        user_id=current_user.id,
        action="IMPORT_BUDGET_XLS",
        details=f"Imported xls: {file.filename}"
    )
    db.add(activity)
    
    db.commit()
    return {"status": "success", "rows_processed": stats.get("success", 0)}

@router.put("/tracker/{service_id}")
async def update_budget(
    service_id: int, 
    data: BudgetUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(ServiceMaster).filter(ServiceMaster.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Capture Old State for Audit
    old_state = {}
    
    # Update master and check diffs
    changes = []
    
    update_data = data.dict(exclude_unset=True)
    
    # Fields to check in ServiceMaster
    for key, value in update_data.items():
        if key in ['budget', 'actuals']: continue # Handle financial separately
        
        if hasattr(service, key):
            old_val = getattr(service, key)
            # Normalize for comparison
            if old_val != value:
                # Log change
                audit = AuditLog(
                    user_id=current_user.id,
                    table_name="service_master",
                    record_id=service.id,
                    field_name=key,
                    old_value=str(old_val),
                    new_value=str(value)
                )
                db.add(audit)
                changes.append(f"{key}: {old_val} -> {value}")
                
                # Apply change
                setattr(service, key, value)
    
    # Update financial
    if data.budget is not None or data.actuals is not None:
        financial = db.query(FYFinancials).filter_by(service_id=service_id, fy=settings.DEFAULT_FY).first()
        if not financial:
            financial = FYFinancials(service_id=service_id, fy=settings.DEFAULT_FY)
            db.add(financial)
            
        if data.budget is not None and financial.budget != data.budget:
            audit = AuditLog(
                user_id=current_user.id,
                table_name="fy_financials",
                record_id=financial.id,
                field_name="budget",
                old_value=str(financial.budget),
                new_value=str(data.budget)
            )
            db.add(audit)
            changes.append(f"budget: {financial.budget} -> {data.budget}")
            financial.budget = data.budget
            
        if data.actuals is not None and financial.actuals != data.actuals:
            audit = AuditLog(
                user_id=current_user.id,
                table_name="fy_financials",
                record_id=financial.id,
                field_name="actuals",
                old_value=str(financial.actuals),
                new_value=str(data.actuals)
            )
            db.add(audit)
            changes.append(f"actuals: {financial.actuals} -> {data.actuals}")
            financial.actuals = data.actuals
        
    # Activity Log
    if changes:
        activity = ActivityLog(
            user_id=current_user.id,
            action="UPDATE_BUDGET",
            details=f"Updated Service ID {service_id}. Changes: {'; '.join(changes)}"
        )
        db.add(activity)

    db.commit()
    return {"status": "success", "message": "Record updated"}

@router.post("/tracker")
async def create_budget_entry(
    data: BudgetCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate UID
    existing = db.query(ServiceMaster).filter(ServiceMaster.uid == data.uid).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"UID {data.uid} already exists")
    
    # Parse dates
    def parse_dt(d_str):
        if not d_str: return None
        try:
            return pd.to_datetime(d_str).to_pydatetime()
        except:
            return None

    service = ServiceMaster(
        uid=data.uid,
        parent_uid=data.parent_uid,
        vendor=data.vendor,
        description=data.description,
        tower=data.tower,
        budget_head=data.budget_head,
        contract=data.contract,
        po_entity=data.po_entity,
        allocation_basis=data.allocation_basis,
        initiative_type=data.initiative_type,
        service_type=data.service_type,
        currency=data.currency,
        start_date=parse_dt(data.service_start_date),
        end_date=parse_dt(data.service_end_date),
        renewal_month=parse_dt(data.renewal_month),
        remarks=data.remarks
    )
    db.add(service)
    db.flush() # Get ID

    financial = FYFinancials(
        service_id=service.id,
        fy=settings.DEFAULT_FY,
        budget=data.budget or 0.0,
        actuals=data.actuals or 0.0
    )
    db.add(financial)
    
    # Activity Log
    activity = ActivityLog(
        user_id=current_user.id,
        action="CREATE_BUDGET",
        details=f"Created new budget entry: {data.uid}"
    )
    db.add(activity)
    db.commit()
    
    return {"status": "success", "message": "Entry created successfully", "id": service.id}

@router.delete("/tracker/{service_id}")
async def delete_budget_row(
    service_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(ServiceMaster).filter(ServiceMaster.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    db.delete(service)
    
    # Activity Log
    activity = ActivityLog(
        user_id=current_user.id,
        action="DELETE_BUDGET",
        details=f"Deleted Service ID {service_id} (UID: {service.uid})"
    )
    db.add(activity)

    db.commit()
    return {"status": "success", "message": "Record deleted"}


@router.get("/boa-allocation")
async def get_boa_allocation(
    db: Session = Depends(get_db),
    fy: str = Query(settings.DEFAULT_FY, pattern=r"^FY\d{4}$")
):
    """Get BOA allocation data"""
    
    # Get rows from independent table
    rows_db = db.query(BOARow).filter(BOARow.fy == fy).options(joinedload(BOARow.values)).all()
    
    rows = []
    entities = set()
    
    for r in rows_db:
        row = {
            "id": r.id,
            "service_uid": r.service_name, # Mapping to frontend "Service" column
            "basis": r.basis,
            "total_count": r.total_count
        }
        
        for v in r.values:
            row[v.entity] = v.value
            entities.add(v.entity)
            
            # Calculate Pct
            if r.total_count > 0:
                row[f"pct_{v.entity}"] = (v.value / r.total_count) * 100
            else:
                row[f"pct_{v.entity}"] = 0
        
        rows.append(row)
        
    return {
        "rows": rows,
        "entities": sorted(list(entities))
    }

@router.post("/import-boa")
async def import_boa(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    fy: str = settings.DEFAULT_FY
):
    """Import BOA allocation data"""
    is_valid, error_msg = FileUploadValidator.validate_excel_file(
        file.filename, 
        file.size if hasattr(file, 'size') else 0
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
        
    content = await file.read()
    stats = ExcelService.process_boa_import(db, content, fy)
    return {"status": "success", "details": stats}

@router.put("/boa-allocation/{id}")
async def update_boa_allocation(
    id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Update BOA allocation row"""
    # This would update the Allocation table
    # For now partial implementation
    return {"status": "success", "message": "Allocations updated"}

@router.get("/export-boa")
async def export_boa(
    db: Session = Depends(get_db),
    fy: str = Query(settings.DEFAULT_FY)
):
    """Export BOA allocation data as Excel"""
    rows_db = db.query(BOARow).filter(BOARow.fy == fy).options(joinedload(BOARow.values)).all()
    
    # Get all unique entities first
    entities = set()
    for r in rows_db:
        for v in r.values:
            entities.add(v.entity)
    sorted_entities = sorted(list(entities))
    
    # Prepare data for DataFrame
    data_list = []
    headers = ["Service", "Basis", "Total Count"] + sorted_entities
    
    for r in rows_db:
        row_dict = {
            "Service": r.service_name,
            "Basis": r.basis,
            "Total Count": r.total_count
        }
        val_map = {v.entity: v.value for v in r.values}
        for ent in sorted_entities:
            row_dict[ent] = val_map.get(ent, 0)
        data_list.append(row_dict)
        
    df = pd.DataFrame(data_list, columns=headers)
    
    output = io.BytesIO()
    # Write to Excel
    # Using 'openpyxl' as engine is standard for xlsx
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
        
    output.seek(0)
    
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"Allocation_Base_{timestamp}.xlsx"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
