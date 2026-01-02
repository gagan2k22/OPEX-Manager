"""
backend/app/routers/budgets.py
Budget management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional
import csv
import io
import pandas as pd

from app.database import get_db
from app.models.schemas import ServiceMaster, FYFinancials, Allocation, BOARow, BOAValue, ImportLog, ActivityLog, AuditLog, User, ImportBatch, StagingBudget, StagingChange, RemarksHistory
from app.services.excel_import import ExcelService
from app.utils.config import settings
from app.utils.validations import BudgetUpdate, BudgetCreate
from app.utils.logger import logger
from app.utils.input_validation import BudgetSearchRequest, FileUploadValidator
from app.utils.security import require_admin, get_current_user, super_admin_required
import json
from datetime import datetime

router = APIRouter()

@router.get("/tracker")
async def get_tracker(
    db: Session = Depends(get_db),
    page: int = Query(0, ge=0),
    pageSize: int = Query(100, ge=1, le=50000),
    search: str = Query("", max_length=100),
    fy: str = Query(settings.DEFAULT_FY, pattern=r"^FY\d{2,4}$"),
    filters: str = Query(None, description="JSON string of DataGrid filter model")
):
    """Get budget tracker data with validation, optimized queries, and server-side filtering"""
    
    # Sanitize search input to prevent SQL injection
    if search:
        # Remove dangerous SQL characters
        import re
        # Escape LIKE wildcards to prevent injection
        search = search.replace('\\', '\\\\').replace('%', '%').replace('_', '_')
        # Remove dangerous characters and limit length
        search = re.sub(r'[;\'"--]', '', search).strip()[:100]
    
    # Use eager loading to prevent N+1 queries
    query = db.query(ServiceMaster).options(
        joinedload(ServiceMaster.financials)
    )
    
    # Apply global search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                ServiceMaster.uid.ilike(search_term),
                ServiceMaster.vendor.ilike(search_term),
                ServiceMaster.service.ilike(search_term),
                ServiceMaster.description.ilike(search_term)
            )
        )
    
    # Apply DataGrid column-specific filters
    if filters:
        try:
            filter_obj = json.loads(filters)
            filter_items = filter_obj.get('items', [])
            
            for item in filter_items:
                field = item.get('field')
                operator = item.get('operator', 'contains')
                value = item.get('value')
                
                if not field or value is None:
                    continue
                
                # Map frontend field names to backend model attributes
                field_map = {
                    'uid': ServiceMaster.uid,
                    'parent_uid': ServiceMaster.parent_uid,
                    'vendor': ServiceMaster.vendor,
                    'description': ServiceMaster.description,
                    'budget_head': ServiceMaster.budget_head,
                    'tower': ServiceMaster.tower,
                    'contract': ServiceMaster.contract,
                    'po_entity': ServiceMaster.po_entity,
                    'allocation_basis': ServiceMaster.allocation_basis,
                    'initiative_type': ServiceMaster.initiative_type,
                    'service_type': ServiceMaster.service_type,
                    'currency': ServiceMaster.currency,
                    'remarks': ServiceMaster.remarks
                }
                
                if field in field_map:
                    model_field = field_map[field]
                    
                    # Apply filter based on operator
                    if operator == 'contains':
                        query = query.filter(model_field.ilike(f"%{value}%"))
                    elif operator == 'equals':
                        query = query.filter(model_field == value)
                    elif operator == 'startsWith':
                        query = query.filter(model_field.ilike(f"{value}%"))
                    elif operator == 'endsWith':
                        query = query.filter(model_field.ilike(f"%{value}"))
                    elif operator == 'isEmpty':
                        query = query.filter(or_(model_field == None, model_field == ''))
                    elif operator == 'isNotEmpty':
                        query = query.filter(and_(model_field != None, model_field != ''))
                    elif operator == 'isAnyOf':
                        if isinstance(value, list):
                            query = query.filter(model_field.in_(value))
                            
        except json.JSONDecodeError:
            logger.warning(f"Invalid filter JSON: {filters}")
        except Exception as e:
            logger.error(f"Error applying filters: {e}")
    
    # Filter by FY: Either in financials or mentioned in UID
    # This ensures "View FY filter should display data based on the Financial Year (FY) mentioned in the UID"
    fy_short = fy.replace("FY20", "FY") # FY2025 -> FY25
    query = query.filter(
        or_(
            ServiceMaster.financials.any(FYFinancials.fy == fy),
            ServiceMaster.uid.ilike(f"%{fy_short}%")
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

@router.get("/tracker/{service_id}/history")
async def get_remarks_history(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch remarks history for a specific budget record"""
    history = db.query(RemarksHistory).filter(RemarksHistory.parent_id == service_id).order_by(RemarksHistory.created_at.desc()).all()
    
    return [
        {
            "id": h.id,
            "remark_text": h.remark_text,
            "created_by": h.created_by,
            "created_at": h.created_at
        }
        for h in history
    ]

@router.post("/import")
async def import_budgets(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    fy: str = Form(settings.DEFAULT_FY),
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

@router.get("/fys")
async def get_fiscal_years(db: Session = Depends(get_db)):
    """Get all unique fiscal years available in the system"""
    fys = db.query(FYFinancials.fy).distinct().all()
    # Sort FYs properly (FY2024, FY2025, etc.)
    return sorted([f[0] for f in fys])

@router.get("/export")
async def export_budget_tracker(
    db: Session = Depends(get_db),
    fy: str = Query(None),
    search: str = Query(""),
    filters: str = Query(None, description="JSON string of DataGrid filter model")
):
    """Export budget tracker data as Excel - ALL rows, bypassing pagination"""
    logger.info("="*80)
    logger.info("📤 BUDGET TRACKER EXPORT STARTED")
    logger.info(f"📤 Parameters received:")
    logger.info(f"   - FY: '{fy}' (type: {type(fy).__name__})")
    logger.info(f"   - Search: '{search}' (type: {type(search).__name__})")
    logger.info(f"   - Filters: {filters[:100] if filters else 'None'}")
    logger.info("="*80)
    
    # Eager loading to prevent N+1 queries
    query = db.query(ServiceMaster).options(joinedload(ServiceMaster.financials))
    logger.info(f"📤 Initial query created")
    
    # Apply global search filter
    if search:
        logger.info(f"📤 Applying search filter: '{search}'")
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                ServiceMaster.uid.ilike(search_term),
                ServiceMaster.vendor.ilike(search_term),
                ServiceMaster.service.ilike(search_term),
                ServiceMaster.description.ilike(search_term)
            )
        )
    else:
        logger.info("📤 No search filter applied")
    
    # Apply DataGrid column-specific filters (same logic as tracker endpoint)
    if filters:
        try:
            filter_obj = json.loads(filters)
            filter_items = filter_obj.get('items', [])
            
            for item in filter_items:
                field = item.get('field')
                operator = item.get('operator', 'contains')
                value = item.get('value')
                
                if not field or value is None:
                    continue
                
                # Map frontend field names to backend model attributes
                field_map = {
                    'uid': ServiceMaster.uid,
                    'parent_uid': ServiceMaster.parent_uid,
                    'vendor': ServiceMaster.vendor,
                    'description': ServiceMaster.description,
                    'budget_head': ServiceMaster.budget_head,
                    'tower': ServiceMaster.tower,
                    'contract': ServiceMaster.contract,
                    'po_entity': ServiceMaster.po_entity,
                    'allocation_basis': ServiceMaster.allocation_basis,
                    'initiative_type': ServiceMaster.initiative_type,
                    'service_type': ServiceMaster.service_type,
                    'currency': ServiceMaster.currency,
                    'remarks': ServiceMaster.remarks
                }
                
                if field in field_map:
                    model_field = field_map[field]
                    
                    # Apply filter based on operator
                    if operator == 'contains':
                        query = query.filter(model_field.ilike(f"%{value}%"))
                    elif operator == 'equals':
                        query = query.filter(model_field == value)
                    elif operator == 'startsWith':
                        query = query.filter(model_field.ilike(f"{value}%"))
                    elif operator == 'endsWith':
                        query = query.filter(model_field.ilike(f"%{value}"))
                    elif operator == 'isEmpty':
                        query = query.filter(or_(model_field == None, model_field == ''))
                    elif operator == 'isNotEmpty':
                        query = query.filter(and_(model_field != None, model_field != ''))
                    elif operator == 'isAnyOf':
                        if isinstance(value, list):
                            query = query.filter(model_field.in_(value))
                            
        except json.JSONDecodeError:
            logger.warning(f"Invalid filter JSON: {filters}")
        except Exception as e:
            logger.error(f"Error applying filters to export: {e}")
    
    # Apply FY filter if specified
    if fy and fy != "":
        logger.info(f"Applying FY filter: {fy}")
        fy_short = fy.replace("FY20", "FY")  # FY2025 -> FY25
        query = query.filter(
            or_(
                ServiceMaster.financials.any(FYFinancials.fy == fy),
                ServiceMaster.uid.ilike(f"%{fy_short}%")
            )
        )
    else:
        logger.info("No FY filter applied - exporting all FYs")
    
    # Log the SQL query for debugging
    logger.info(f"Export query: {str(query)}")
    
    # Fetch ALL services (no pagination for export)
    services = query.all()
    logger.info(f"📤 Found {len(services)} services for export")
    
    # MANDATORY SAFETY CHECK - Prevent empty Excel exports
    if not services or len(services) == 0:
        logger.error(f"❌ No data available for export with FY={fy}, search='{search}'")
        raise HTTPException(
            status_code=400,
            detail=f"No data available to export. Please check: 1) Data has been imported, 2) FY filter '{fy}' is correct, 3) Search/filters are not too restrictive"
        )
    
    # Process services into export data
    data_list = []
    for s in services:
        financial = next((f for f in s.financials if f.fy == fy), None) if fy else None
        
        # Get budget and actual values with proper fallbacks
        budget_val = float(financial.budget) if financial and financial.budget is not None else 0.0
        actual_val = float(financial.actuals) if financial and financial.actuals is not None else 0.0
        
        row = {
            "UID": str(s.uid) if s.uid else "",
            "Parent UID": str(s.parent_uid) if s.parent_uid else "",
            "Vendor": str(s.vendor) if s.vendor else "",
            "Service Description": str(s.description) if s.description else "",
            "Start Date": s.start_date.strftime("%Y-%m-%d") if s.start_date else "",
            "End Date": s.end_date.strftime("%Y-%m-%d") if s.end_date else "",
            "Renewal Month": s.renewal_month.strftime("%Y-%m-%d") if s.renewal_month else "",
            "Budget Head": str(s.budget_head) if s.budget_head else "",
            "Tower": str(s.tower) if s.tower else "",
            "Contract": str(s.contract) if s.contract else "",
            "PO Entity": str(s.po_entity) if s.po_entity else "",
            "Allocation Basis": str(s.allocation_basis) if s.allocation_basis else "",
            "Initiative Type": str(s.initiative_type) if s.initiative_type else "",
            "Service Type": str(s.service_type) if s.service_type else "",
            "Currency": str(s.currency) if s.currency else "INR",
            "Budget": budget_val,
            "Actual": actual_val,
            "Variance": budget_val - actual_val,
            "Remarks": str(s.remarks) if s.remarks else ""
        }
        data_list.append(row)
    
    logger.info(f"Prepared {len(data_list)} rows for export")
    
    # Create DataFrame and Excel file
    df = pd.DataFrame(data_list)
    output = io.BytesIO()
    
    try:
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Budget Tracker')
        
        # CRITICAL: Extract the complete buffer content before creating response
        # This prevents the buffer from being closed prematurely
        output.seek(0)
        excel_data = output.getvalue()
        
        # Verify we have data
        if not excel_data or len(excel_data) == 0:
            logger.error("❌ Generated Excel file is empty!")
            raise HTTPException(status_code=500, detail="Generated Excel file is empty")
        
        logger.info(f"✅ Excel file generated: {len(excel_data)} bytes, {len(data_list)} rows")
        
        # Create a new BytesIO with the extracted data
        final_output = io.BytesIO(excel_data)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"budget_tracker_{fy if fy else 'all'}_{timestamp}.xlsx"
        
        logger.info(f"✅ Export successful: {filename}")
        
        return StreamingResponse(
            final_output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"❌ Budget export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/compare-data")
async def get_comparison_data(
    fy1: str = Query(...),
    fy2: str = Query(...),
    db: Session = Depends(get_db)
):
    """Fetch and merge data for comparison between two fiscal years"""
    # Fetch all services that have financials for either fy1 or fy2
    query = db.query(ServiceMaster).options(joinedload(ServiceMaster.financials)).filter(
        ServiceMaster.financials.any(FYFinancials.fy.in_([fy1, fy2]))
    )
    
    services = query.all()
    rows = []
    
    for s in services:
        f1 = next((f for f in s.financials if f.fy == fy1), None)
        f2 = next((f for f in s.financials if f.fy == fy2), None)
        
        rows.append({
            "uid": s.uid,
            "vendor": s.vendor,
            "description": s.description,
            "service_start_date": s.start_date,
            "service_end_date": s.end_date,
            "currency": s.currency,
            "budget1": f1.budget if f1 else 0,
            "actual1": f1.actuals if f1 else 0,
            "budget2": f2.budget if f2 else 0,
            "actual2": f2.actuals if f2 else 0
        })
        
    return rows

@router.get("/export-comparison")
async def export_comparison(
    fy1: str = Query(...),
    fy2: str = Query(...),
    db: Session = Depends(get_db)
):
    """Export comparison data between two FYs"""
    logger.info(f"Exporting comparison: {fy1} vs {fy2}")
    
    query = db.query(ServiceMaster).options(joinedload(ServiceMaster.financials)).filter(
        ServiceMaster.financials.any(FYFinancials.fy.in_([fy1, fy2]))
    )
    
    services = query.all()
    logger.info(f"Found {len(services)} services for comparison export")
    
    if not services:
        logger.warning(f"No services found for FY {fy1} or {fy2}")
        # Return empty Excel with headers
        data_list = [{
            "UID": "",
            "Vendor": "",
            "Service Description": "",
            "Start Date": "",
            "End Date": "",
            f"{fy1} Budget": 0,
            f"{fy1} Actual": 0,
            f"{fy2} Budget": 0,
            f"{fy2} Actual": 0,
            "Budget Difference": 0,
            "Actual Difference": 0
        }]
    else:
        data_list = []
        
        for s in services:
            f1 = next((f for f in s.financials if f.fy == fy1), None)
            f2 = next((f for f in s.financials if f.fy == fy2), None)
            
            # Get budget and actual values with proper fallbacks
            budget1 = float(f1.budget) if f1 and f1.budget is not None else 0.0
            actual1 = float(f1.actuals) if f1 and f1.actuals is not None else 0.0
            budget2 = float(f2.budget) if f2 and f2.budget is not None else 0.0
            actual2 = float(f2.actuals) if f2 and f2.actuals is not None else 0.0
            
            row = {
                "UID": str(s.uid) if s.uid else "",
                "Vendor": str(s.vendor) if s.vendor else "",
                "Service Description": str(s.description) if s.description else "",
                "Start Date": s.start_date.strftime("%Y-%m-%d") if s.start_date else "",
                "End Date": s.end_date.strftime("%Y-%m-%d") if s.end_date else "",
                f"{fy1} Budget": budget1,
                f"{fy1} Actual": actual1,
                f"{fy2} Budget": budget2,
                f"{fy2} Actual": actual2,
                "Budget Difference": budget2 - budget1,
                "Actual Difference": actual2 - actual1
            }
            data_list.append(row)
            
    logger.info(f"Prepared {len(data_list)} rows for export")
    
    # Create DataFrame and Excel file
    df = pd.DataFrame(data_list)
    output = io.BytesIO()
    
    try:
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Comparison')
        
        # CRITICAL: Extract the complete buffer content before creating response
        output.seek(0)
        excel_data = output.getvalue()
        
        # Verify we have data
        if not excel_data or len(excel_data) == 0:
            logger.error("❌ Generated comparison Excel file is empty!")
            raise HTTPException(status_code=500, detail="Generated Excel file is empty")
        
        logger.info(f"✅ Comparison Excel file generated: {len(excel_data)} bytes, {len(data_list)} rows")
        
        # Create a new BytesIO with the extracted data
        final_output = io.BytesIO(excel_data)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"budget_comparison_{fy1}_vs_{fy2}_{timestamp}.xlsx"
        
        logger.info(f"✅ Comparison export successful: {filename}")
        
        return StreamingResponse(
            final_output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"❌ Comparison export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/xls")
async def import_budgets_xls(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    fy: str = Form(settings.DEFAULT_FY),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Importing Excel budget file: {file.filename} for FY: {fy} by user: {current_user.email}")
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
    current_user: User = Depends(get_current_user),
    fy: str = settings.DEFAULT_FY
):
    service = db.query(ServiceMaster).filter(ServiceMaster.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Capture Old State for Audit
    old_state = {}
    
    # Update master and check diffs
    changes = []
    
    update_data = data.dict(exclude_unset=True)
    
    # Fields to check in ServiceMaster (handle mapping)
    field_map = {
        'service_start_date': 'start_date',
        'service_end_date': 'end_date'
    }
    
    for key, value in update_data.items():
        if key in ['budget', 'actuals']: continue # Handle financial separately
        
        # Determine actual model field name
        model_field = field_map.get(key, key)
        
        if hasattr(service, model_field):
            # Parse dates if the field is a date field
            if 'date' in model_field or 'month' in model_field:
                try:
                    value = pd.to_datetime(value).to_pydatetime() if value else None
                except:
                    pass

            old_val = getattr(service, model_field)
            # Normalize for comparison
            if old_val != value:
                audit = AuditLog(
                    user_id=current_user.id,
                    table_name="service_master",
                    record_id=service.id,
                    field_name=model_field,
                    old_value=str(old_val),
                    new_value=str(value)
                )
                db.add(audit)
                changes.append(f"{model_field}: {old_val} -> {value}")

                # Special handling for remarks history
                if model_field == 'remarks':
                    # Create remarks history entry
                    history_entry = RemarksHistory(
                        parent_id=service.id,
                        remark_text=value,
                        created_by=current_user.name or current_user.email,
                    )
                    db.add(history_entry)
                
                # Apply change
                setattr(service, model_field, value)
    
    # Update financial
    # Update financial
    if data.budget is not None or data.actuals is not None:
        financial = db.query(FYFinancials).filter_by(service_id=service_id, fy=fy).first()
        if not financial:
            financial = FYFinancials(service_id=service_id, fy=fy)
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
    current_user: User = Depends(get_current_user),
    fy: str = settings.DEFAULT_FY
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

    if data.remarks:
        history_entry = RemarksHistory(
            parent_id=service.id,
            remark_text=data.remarks,
            created_by=current_user.name or current_user.email,
        )
        db.add(history_entry)

    financial = FYFinancials(
        service_id=service.id,
        fy=fy,
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
    fy: str = Form(settings.DEFAULT_FY)
):
    logger.info(f"Importing BOA allocation file: {file.filename} for FY: {fy} by user: {current_user.email}")
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
    
    try:
        # Write to Excel using openpyxl engine
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='BOA Allocation')
        
        # CRITICAL: Extract the complete buffer content before creating response
        output.seek(0)
        excel_data = output.getvalue()
        
        # Verify we have data
        if not excel_data or len(excel_data) == 0:
            logger.error("❌ Generated BOA allocation Excel file is empty!")
            raise HTTPException(status_code=500, detail="Generated Excel file is empty")
        
        logger.info(f"✅ BOA allocation Excel file generated: {len(excel_data)} bytes, {len(data_list)} rows")
        
        # Create a new BytesIO with the extracted data
        final_output = io.BytesIO(excel_data)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"Allocation_Base_{fy}_{timestamp}.xlsx"
        
        logger.info(f"✅ BOA export successful: {filename}")
        
        return StreamingResponse(
            final_output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"❌ BOA export failed: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/tracker/check-uid/{uid}")
async def check_uid_availability(uid: str, db: Session = Depends(get_db)):
    """Check if UID exists"""
    exists = db.query(ServiceMaster).filter(ServiceMaster.uid == uid).first() is not None
    return {"exists": exists}

@router.get("/tracker/history/{service_id}")
async def get_uid_history(service_id: int, db: Session = Depends(get_db)):
    """Get financial history for a service across all years"""
    service = db.query(ServiceMaster).filter(ServiceMaster.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    financials = db.query(FYFinancials).filter(FYFinancials.service_id == service.id).order_by(FYFinancials.fy).all()
    
    return [
        {
            "fy": f.fy,
            "budget": f.budget,
            "actuals": f.actuals,
            "variance": f.budget - f.actuals
        }
        for f in financials
    ]

# --- Admin-Only Re-Upload Flow ---

@router.post("/upload/compare")
async def compare_upload(
    file: UploadFile = File(...),
    fy: str = Form(settings.DEFAULT_FY),
    db: Session = Depends(get_db),
    admin: User = Depends(super_admin_required)
):
    """Step 1 & 2: Process Excel vs DB and return comparison summary"""
    logger.info(f"Re-Upload Compare requested by ADMIN: {admin.email}")
    
    content = await file.read()
    batch = ExcelService.stage_budget_import(db, content, fy, admin.id, file.filename)
    
    # Audit log
    activity = ActivityLog(
        user_id=admin.id,
        action="REUPLOAD_COMPARE",
        details=f"Initiated re-upload comparison for {file.filename} (FY: {fy}). Batch ID: {batch.id}"
    )
    db.add(activity)
    db.commit()
    
    return {
        "status": "success",
        "batch_id": batch.id,
        "summary": json.loads(batch.summary) if batch.summary else {},
        "filename": batch.filename,
        "fy": batch.fy
    }

@router.get("/upload/comparison/{batch_id}")
async def get_staged_changes(
    batch_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(super_admin_required)
):
    """Retrieve row-level diffs for a staged batch"""
    changes = db.query(StagingChange).filter_by(batch_id=batch_id).all()
    
    result = []
    for c in changes:
        result.append({
            "uid": c.uid,
            "type": c.change_type,
            "fields": c.changed_fields.split(",") if c.changed_fields else [],
            "diff": json.loads(c.diff_data) if c.diff_data else {}
        })
    return result

@router.post("/upload/confirm/{batch_id}")
async def confirm_upload(
    batch_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(super_admin_required)
):
    """Step 4: Commit changes to production database"""
    logger.info(f"REUPLOAD_CONFIRM requested for Batch {batch_id} by ADMIN {admin.email}")
    
    # Apply changes
    stats = ExcelService.apply_staged_import(db, batch_id)
    
    # Audit trail
    batch = db.query(ImportBatch).filter_by(id=batch_id).first()
    activity = ActivityLog(
        user_id=admin.id,
        action="REUPLOAD_CONFIRM",
        details=f"Confirmed and committed re-upload Batch {batch_id}. Summary: {batch.summary}"
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Database updated successfully", "batch_id": batch_id}

@router.post("/upload/cancel/{batch_id}")
async def cancel_upload(
    batch_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(super_admin_required)
):
    """Step 4: Discard staging data"""
    logger.info(f"REUPLOAD_CANCEL requested for Batch {batch_id} by ADMIN {admin.email}")
    
    batch = db.query(ImportBatch).filter_by(id=batch_id, status="STAGED").first()
    if not batch:
        raise HTTPException(status_code=404, detail="Staged batch not found")
        
    batch.status = "CANCELLED"
    db.commit()
    
    # Activity Log
    activity = ActivityLog(
        user_id=admin.id,
        action="REUPLOAD_CANCEL",
        details=f"Cancelled re-upload Batch {batch_id}."
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Upload cancelled and staging data discarded"}

@router.get("/export/comparison/{batch_id}")
async def export_staged_comparison(
    batch_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(super_admin_required)
):
    """Export the comparison results for a batch as Excel"""
    changes = db.query(StagingChange).filter_by(batch_id=batch_id).all()
    
    data_list = []
    for c in changes:
        diff = json.loads(c.diff_data) if c.diff_data else {}
        row = {
            "UID": c.uid,
            "Change Type": c.change_type,
            "Altered Fields": c.changed_fields
        }
        # Add old/new values for common fields if modified
        if c.change_type == "MODIFIED":
            for field, vals in diff.items():
                row[f"{field} (Old)"] = vals.get("old")
                row[f"{field} (New)"] = vals.get("new")
        
        data_list.append(row)
        
    df = pd.DataFrame(data_list)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Comparison Results')
    
    # CRITICAL: Extract the complete buffer content before creating response
    output.seek(0)
    excel_data = output.getvalue()
    
    # Verify we have data
    if not excel_data or len(excel_data) == 0:
        logger.error("❌ Generated staged comparison Excel file is empty!")
        raise HTTPException(status_code=500, detail="Generated Excel file is empty")
    
    logger.info(f"✅ Staged comparison Excel file generated: {len(excel_data)} bytes, {len(data_list)} rows")
    
    # Create a new BytesIO with the extracted data
    final_output = io.BytesIO(excel_data)
    
    filename = f"comparison_report_{batch_id}.xlsx"
    return StreamingResponse(
        final_output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
