"""
BOA Allocation Service
Replaces services/boaAllocation.service.js
Using Pandas for matrix calculations
"""

from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import Dict, Any

from models import (
    ServiceMaster, AllocationBasis, ServiceEntityAllocation, 
    EntityMaster, ImportHistory
)
from utils.logger import setup_logger

logger = setup_logger(__name__)

class BOAAllocationService:
    @staticmethod
    async def import_boa_allocation(
        file_content: bytes,
        user_id: int,
        filename: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Matrix-based BOA Import
        Format: Service UID | Basis | Total Count | Entity1 | Entity2 ...
        """
        try:
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Identify Entity Columns (assuming they start after first 3 columns)
            # Standard format: [UID, Basis, Total Count, ...Entities]
            entities_in_db = {e.entity_name: e.id for e in db.query(EntityMaster).all()}
            
            stats = {"total": len(df), "success": 0, "failed": 0}
            
            for _, row in df.iterrows():
                try:
                    uid = str(row.iloc[0]).strip()
                    basis = str(row.iloc[1]).strip()
                    total_count = float(row.iloc[2]) if pd.notna(row.iloc[2]) else 0
                    
                    service = db.query(ServiceMaster).filter_by(uid=uid).first()
                    if not service:
                        continue
                        
                    # Update Basis
                    alloc_basis = db.query(AllocationBasis).filter_by(service_id=service.id).first()
                    if not alloc_basis:
                        alloc_basis = AllocationBasis(service_id=service.id)
                        db.add(alloc_basis)
                    alloc_basis.basis_of_allocation = basis
                    alloc_basis.total_count = int(total_count)
                    
                    # Update Splits
                    for col_name in df.columns[3:]:
                        if col_name in entities_in_db:
                            entity_id = entities_in_db[col_name]
                            val = float(row[col_name]) if pd.notna(row[col_name]) else 0
                            
                            split = db.query(ServiceEntityAllocation).filter_by(
                                service_id=service.id, 
                                entity_id=entity_id
                            ).first()
                            
                            if not split:
                                split = ServiceEntityAllocation(
                                    service_id=service.id, 
                                    entity_id=entity_id
                                )
                                db.add(split)
                            split.count = val
                    
                    stats["success"] += 1
                except Exception as e:
                    stats["failed"] += 1
                    logger.warning(f"Row fail: {e}")
            
            db.commit()
            return stats
        except Exception as e:
            db.rollback()
            logger.error(f"BOA Import Error: {e}")
            raise e
