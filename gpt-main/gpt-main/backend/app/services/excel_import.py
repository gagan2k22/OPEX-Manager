"""
backend/app/services/excel_import.py
Excel import logic using Pandas
"""
import pandas as pd
import io
from sqlalchemy.orm import Session
from app.models.schemas import ServiceMaster, FYFinancials
from app.utils.logger import logger

class ExcelService:
    @staticmethod
    def process_budget_import(db: Session, file_content: bytes, fy: str):
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            df = df.fillna("")
            # Normalize headers: strip whitespace
            df.columns = df.columns.str.strip()
            
            # Basic mapping
            # UID, Vendor, Service, Description, Tower, Budget Head, Budget, Actuals, Remarks
            stats = {"success": 0, "failed": 0, "total": len(df)}
            
            for _, row in df.iterrows():
                try:
                    uid = str(row.get("UID", "")).strip()
                    if not uid: continue
                    
                    # Upsert ServiceMaster
                    service = db.query(ServiceMaster).filter(ServiceMaster.uid == uid).first()
                    if not service:
                        service = ServiceMaster(uid=uid)
                        db.add(service)
                        db.flush()
                    
                    service.vendor = str(row.get("Vendor", ""))
                    service.service = str(row.get("Service", ""))
                    service.description = str(row.get("Service Description", "") or row.get("Description", ""))
                    service.tower = str(row.get("Tower", ""))
                    service.budget_head = str(row.get("Budget Head", ""))
                    service.remarks = str(row.get("Remarks", ""))
                    
                    service.parent_uid = str(row.get("Parent UID", "") or "")
                    service.contract = str(row.get("Contract", "") or "")
                    service.po_entity = str(row.get("PO Entity", "") or "")
                    # Matches "Initiative Type(New / Existing)" or "Initiative Type"
                    service.initiative_type = str(row.get("Initiative Type(New / Existing)", "") or row.get("Initiative Type", "") or "")
                    service.service_type = str(row.get("Service Type", "") or "")
                    service.allocation_basis = str(row.get("Allocation Basis", "") or "")
                    service.currency = str(row.get("Currency", "") or "INR") # Default to INR if missing
                    
                    # Handle Dates (robust parsing)
                    def parse_date(val):
                        if not val or str(val).strip() == "": return None
                        try:
                            # Handle Excel serial dates if necessary, though pandas usually handles them
                            return pd.to_datetime(val).to_pydatetime()
                        except:
                            return None

                    # Match "Service Start Date" or "Start Date"
                    service.start_date = parse_date(row.get("Service Start Date") or row.get("Start Date"))
                    # Match "Service End Date" or "End Date"
                    service.end_date = parse_date(row.get("Service End Date") or row.get("End Date"))
                    service.renewal_month = parse_date(row.get("Renewal Month"))
                    
                    # Upsert Financials
                    financial = db.query(FYFinancials).filter_by(service_id=service.id, fy=fy).first()
                    if not financial:
                        financial = FYFinancials(service_id=service.id, fy=fy)
                        db.add(financial)
                    
                    # Budget and Actuals with error handling
                    try:
                        budget_val = row.get("Budget", 0) or 0
                        financial.budget = float(budget_val) if budget_val else 0.0
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid budget value for UID {uid}: {e}")
                        financial.budget = 0.0
                    
                    try:
                        actuals_val = row.get("Actual", 0) or row.get("Actuals", 0) or 0
                        financial.actuals = float(actuals_val) if actuals_val else 0.0
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid actuals value for UID {uid}: {e}")
                        financial.actuals = 0.0
                    
                    stats["success"] += 1
                except Exception as e:
                    logger.error(f"Failed to process row: {e}")
                    stats["failed"] += 1
            
            db.commit()
            return stats
        except Exception as e:
            db.rollback()
            logger.error(f"Excel processing failed: {e}")
            raise e
    @staticmethod
    def process_boa_import(db: Session, file_content: bytes, fy: str):
        """
        Import BOA Allocation data into independent BOARow/BOAValue tables.
        """
        from app.models.schemas import BOARow, BOAValue
        
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Clean data
            df = df.replace(['-', ' - ', ' -'], 0)
            df = df.fillna(0)
            
            stats = {"success": 0, "failed": 0, "total": len(df)}
            
            # Identify columns
            col_map = {c.lower().strip(): c for c in df.columns}
            
            # Find key columns
            service_col = col_map.get('service') or col_map.get('vendor / service') or col_map.get('uid')
            basis_col = col_map.get('basis of allocation') or col_map.get('basis')
            total_col = col_map.get('total count') or col_map.get('total')
            
            if not service_col:
                raise ValueError("Column 'Service' or 'Vendor / Service' not found")
            
            # Entities are remaining columns
            known_cols = [service_col, basis_col, total_col]
            known_cols = [c for c in known_cols if c] # filter None
            
            entity_cols = [c for c in df.columns if c not in known_cols]
            
            # FULL REPLACE STRATEGY: Delete existing rows for this FY
            db.query(BOARow).filter(BOARow.fy == fy).delete()
            db.flush()
            
            for _, row in df.iterrows():
                try:
                    name = str(row.get(service_col, "")).strip()
                    if not name: continue
                    
                    basis = str(row.get(basis_col, "Manual")).strip()
                    try:
                        total_raw = row.get(total_col, 0)
                        if isinstance(total_raw, str): total_raw = total_raw.replace(',', '')
                        total_count = float(total_raw)
                    except:
                        total_count = 0.0
                    
                    # Create Row
                    boa_row = BOARow(
                        service_name=name,
                        basis=basis,
                        total_count=total_count,
                        fy=fy
                    )
                    db.add(boa_row)
                    db.flush() # get ID
                    
                    # Create Values
                    values_to_add = []
                    for entity in entity_cols:
                        try:
                            val_raw = row.get(entity, 0)
                            if isinstance(val_raw, str): val_raw = val_raw.replace(',', '')
                            val = float(val_raw)
                        except:
                            val = 0.0
                            
                        # Store standard 0s or keep sparse? 
                        # Store all to ensure grid alignment
                        values_to_add.append(BOAValue(
                            row_id=boa_row.id,
                            entity=entity,
                            value=val
                        ))
                    
                    if values_to_add:
                        db.bulk_save_objects(values_to_add)
                        
                    stats["success"] += 1
                except Exception as e:
                    logger.error(f"Row error: {e}")
                    stats["failed"] += 1
            
            db.commit()
            return stats
        except Exception as e:
            db.rollback()
            logger.error(f"BOA Import failed: {e}")
            raise e
