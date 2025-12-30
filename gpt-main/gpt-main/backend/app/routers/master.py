"""
Master Data Router
backend/app/routers/master.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schemas import (
    EntityMaster, BudgetHeadMaster, TowerMaster, 
    AllocationTypeMaster, POEntityMaster, AllocationBasisMaster,
    ServiceMaster, BOARow, CurrencyMaster
)
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class MasterItemCreate(BaseModel):
    name: str

class MasterItemUpdate(BaseModel):
    name: str

class CurrencyCreate(BaseModel):
    code: str
    rate: float

class CurrencyUpdate(BaseModel):
    code: str
    rate: float

@router.get("/entities")
async def get_entities(db: Session = Depends(get_db)):
    items = db.query(EntityMaster).all()
    # Frontend expects entity_name if it was a PO Entity, but for general Entity it uses .name
    # Dashboard uses entity.entity_name for entities
    return [{"id": i.id, "entity_name": i.name} for i in items]

@router.get("/services")
async def get_services(db: Session = Depends(get_db)):
    items = db.query(ServiceMaster).all()
    return items

@router.get("/budget-heads")
async def get_budget_heads(db: Session = Depends(get_db)):
    # 1. Get Master Heads
    master_items = db.query(BudgetHeadMaster).all()
    # Map: name -> {id, name, is_master: True}
    data_map = {item.name: {"id": item.id, "head_name": item.name, "is_master": True} for item in master_items}
    
    # 2. Get Tracker Heads
    used_heads = db.query(ServiceMaster.budget_head).distinct().all()
    for h in used_heads:
        name = h[0]
        if name and name not in data_map:
            # Derived head. Generate a string ID to distinguish
            data_map[name] = {"id": f"derived_{name}", "head_name": name, "is_master": False}
            
    # Sort by name
    result = sorted(data_map.values(), key=lambda x: x["head_name"])
    return result

@router.post("/budget-heads")
async def create_budget_head(data: MasterItemCreate, db: Session = Depends(get_db)):
    # Check duplicate
    existing = db.query(BudgetHeadMaster).filter(BudgetHeadMaster.name == data.name).first()
    if existing:
        return existing
        
    new_item = BudgetHeadMaster(name=data.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/budget-heads/{id}")
async def update_budget_head(id: str, data: MasterItemUpdate, db: Session = Depends(get_db)):
    # Check if ID is int (Master) or derived
    try:
        db_id = int(id)
        is_derived = False
    except ValueError:
        is_derived = True
        
    old_name = None
    
    if not is_derived:
        # Update Master
        item = db.query(BudgetHeadMaster).filter(BudgetHeadMaster.id == db_id).first()
        if item:
            old_name = item.name
            item.name = data.name
    else:
        # Derived: id is "derived_OldName"
        old_name = id.replace("derived_", "")
        # Create new Master entry if renaming derived to permanent? 
        # Or just update Tracker. 
        # User intention: "Edit this head".
        pass
        
    # Update Tracker Rows (ServiceMaster) - Cascade Update
    if old_name:
        # Bulk update
        db.query(ServiceMaster).filter(ServiceMaster.budget_head == old_name).update(
            {ServiceMaster.budget_head: data.name}, synchronize_session=False
        )
        
    db.commit()
    return {"status": "success"}

@router.delete("/budget-heads/{id}")
async def delete_budget_head(id: str, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except ValueError:
        is_derived = True
        
    head_name = None

    if not is_derived:
        item = db.query(BudgetHeadMaster).filter(BudgetHeadMaster.id == db_id).first()
        if item:
            head_name = item.name
            db.delete(item)
    else:
        head_name = id.replace("derived_", "")
        
    # Also clear from Tracker? Or keep as text?
    # User said "Delete button will work".
    # Usually implies removing the record.
    # If I nullify in Tracker, the head disappears from list entirely.
    if head_name:
        db.query(ServiceMaster).filter(ServiceMaster.budget_head == head_name).update(
            {ServiceMaster.budget_head: ""}, synchronize_session=False
        )

    db.commit()
    return {"status": "success"}

@router.get("/towers")
async def get_towers(db: Session = Depends(get_db)):
    # 1. Master
    master = db.query(TowerMaster).all()
    data_map = {item.name: {"id": item.id, "tower_name": item.name, "is_master": True} for item in master}
    
    # 2. Tracker
    used = db.query(ServiceMaster.tower).distinct().all()
    for u in used:
        name = u[0]
        if name and name not in data_map:
            data_map[name] = {"id": f"derived_{name}", "tower_name": name, "is_master": False}
    
    return sorted(data_map.values(), key=lambda x: x["tower_name"])

@router.post("/towers")
async def create_tower(data: MasterItemCreate, db: Session = Depends(get_db)):
    if db.query(TowerMaster).filter(TowerMaster.name == data.name).first():
        raise HTTPException(status_code=400, detail="Already exists")
    new_item = TowerMaster(name=data.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/towers/{id}")
async def update_tower(id: str, data: MasterItemUpdate, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
        
    old_name = None
    if not is_derived:
        item = db.query(TowerMaster).filter(TowerMaster.id == db_id).first()
        if item:
            old_name = item.name
            item.name = data.name
    else:
        old_name = id.replace("derived_", "")
        
    if old_name:
        db.query(ServiceMaster).filter(ServiceMaster.tower == old_name).update(
            {ServiceMaster.tower: data.name}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.delete("/towers/{id}")
async def delete_tower(id: str, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
        
    name = None
    if not is_derived:
        item = db.query(TowerMaster).filter(TowerMaster.id == db_id).first()
        if item:
            name = item.name
            db.delete(item)
    else:
        name = id.replace("derived_", "")
        
    if name:
        db.query(ServiceMaster).filter(ServiceMaster.tower == name).update(
            {ServiceMaster.tower: ""}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.get("/po-entities")
async def get_po_entities(db: Session = Depends(get_db)):
    # 1. Master (Note: entity_name column)
    master = db.query(POEntityMaster).all()
    data_map = {item.entity_name: {"id": item.id, "entity_name": item.entity_name, "is_master": True} for item in master}
    
    # 2. Tracker (po_entity column)
    used = db.query(ServiceMaster.po_entity).distinct().all()
    for u in used:
        name = u[0]
        if name and name not in data_map:
            data_map[name] = {"id": f"derived_{name}", "entity_name": name, "is_master": False}
    
    return sorted(data_map.values(), key=lambda x: x["entity_name"])

@router.post("/po-entities")
async def create_po_entity(data: MasterItemCreate, db: Session = Depends(get_db)):
    # Maps 'name' from input to 'entity_name'
    if db.query(POEntityMaster).filter(POEntityMaster.entity_name == data.name).first():
         raise HTTPException(status_code=400, detail="Already exists")
    new_item = POEntityMaster(entity_name=data.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/po-entities/{id}")
async def update_po_entity(id: str, data: MasterItemUpdate, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    old_name = None
    if not is_derived:
        item = db.query(POEntityMaster).filter(POEntityMaster.id == db_id).first()
        if item:
            old_name = item.entity_name
            item.entity_name = data.name
    else:
        old_name = id.replace("derived_", "")
        
    if old_name:
        db.query(ServiceMaster).filter(ServiceMaster.po_entity == old_name).update(
            {ServiceMaster.po_entity: data.name}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.delete("/po-entities/{id}")
async def delete_po_entity(id: str, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    name = None
    if not is_derived:
        item = db.query(POEntityMaster).filter(POEntityMaster.id == db_id).first()
        if item:
            name = item.entity_name
            db.delete(item)
    else:
        name = id.replace("derived_", "")
        
    if name:
        db.query(ServiceMaster).filter(ServiceMaster.po_entity == name).update(
            {ServiceMaster.po_entity: ""}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.get("/allocation-types")
async def get_allocation_types(db: Session = Depends(get_db)):
    # 1. Master
    master = db.query(AllocationTypeMaster).all()
    data_map = {item.name: {"id": item.id, "type_name": item.name, "is_master": True} for item in master}
    
    # 2. Tracker (mapping to service_type)
    used = db.query(ServiceMaster.service_type).distinct().all()
    for u in used:
        name = u[0]
        if name and name not in data_map:
            data_map[name] = {"id": f"derived_{name}", "type_name": name, "is_master": False}
    
    return sorted(data_map.values(), key=lambda x: x["type_name"])

@router.post("/allocation-types")
async def create_allocation_type(data: MasterItemCreate, db: Session = Depends(get_db)):
    new_item = AllocationTypeMaster(name=data.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/allocation-types/{id}")
async def update_allocation_type(id: str, data: MasterItemUpdate, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    old_name = None
    if not is_derived:
        item = db.query(AllocationTypeMaster).filter(AllocationTypeMaster.id == db_id).first()
        if item:
            old_name = item.name
            item.name = data.name
    else:
        old_name = id.replace("derived_", "")
        
    if old_name:
        db.query(ServiceMaster).filter(ServiceMaster.service_type == old_name).update(
            {ServiceMaster.service_type: data.name}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.delete("/allocation-types/{id}")
async def delete_allocation_type(id: str, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    name = None
    if not is_derived:
        item = db.query(AllocationTypeMaster).filter(AllocationTypeMaster.id == db_id).first()
        if item:
            name = item.name
            db.delete(item)
    else:
        name = id.replace("derived_", "")
        
    if name:
        db.query(ServiceMaster).filter(ServiceMaster.service_type == name).update(
            {ServiceMaster.service_type: ""}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.get("/allocation-bases")
async def get_allocation_bases(db: Session = Depends(get_db)):
    # 1. Master
    master = db.query(AllocationBasisMaster).all()
    data_map = {item.name: {"id": item.id, "basis_name": item.name, "is_master": True} for item in master}
    
    # 2. Tracker (allocation_basis column)
    used = db.query(ServiceMaster.allocation_basis).distinct().all()
    for u in used:
        name = u[0]
        if name and name not in data_map:
            data_map[name] = {"id": f"derived_{name}", "basis_name": name, "is_master": False}

    # 3. BOA Table (service_name) - As per user request "Budget BOA Allocation under Service"
    boa = db.query(BOARow.service_name).distinct().all()
    for b in boa:
        name = b[0]
        if name and name not in data_map:
             data_map[name] = {"id": f"boa_{name}", "basis_name": name, "is_master": False}
    
    return sorted(data_map.values(), key=lambda x: x["basis_name"])

@router.post("/allocation-bases")
async def create_allocation_basis(data: MasterItemCreate, db: Session = Depends(get_db)):
    new_item = AllocationBasisMaster(name=data.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/allocation-bases/{id}")
async def update_allocation_basis(id: str, data: MasterItemUpdate, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    old_name = None
    if not is_derived:
        item = db.query(AllocationBasisMaster).filter(AllocationBasisMaster.id == db_id).first()
        if item:
            old_name = item.name
            item.name = data.name
    else:
        # Handle derived or boa_ prefixed IDs
        old_name = id.replace("derived_", "").replace("boa_", "")
        
    if old_name:
        db.query(ServiceMaster).filter(ServiceMaster.allocation_basis == old_name).update(
            {ServiceMaster.allocation_basis: data.name}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.delete("/allocation-bases/{id}")
async def delete_allocation_basis(id: str, db: Session = Depends(get_db)):
    try:
        db_id = int(id)
        is_derived = False
    except:
        is_derived = True
    
    name = None
    if not is_derived:
        item = db.query(AllocationBasisMaster).filter(AllocationBasisMaster.id == db_id).first()
        if item:
            name = item.name
            db.delete(item)
    else:
        name = id.replace("derived_", "").replace("boa_", "")
        
    if name:
        db.query(ServiceMaster).filter(ServiceMaster.allocation_basis == name).update(
            {ServiceMaster.allocation_basis: ""}, synchronize_session=False
        )
    db.commit()
    return {"status": "success"}

@router.get("/currencies")
async def get_currencies(db: Session = Depends(get_db)):
    items = db.query(CurrencyMaster).all()
    if not items:
        # Seed defaults
        defaults = [
            CurrencyMaster(code="INR", rate=1.0),
            CurrencyMaster(code="USD", rate=84.0),
            CurrencyMaster(code="CAD", rate=60.0)
        ]
        db.add_all(defaults)
        db.commit()
        items = db.query(CurrencyMaster).all()
        
    return [{"id": i.id, "code": i.code, "rate": i.rate} for i in items]

@router.post("/currencies")
async def create_currency(data: CurrencyCreate, db: Session = Depends(get_db)):
    if db.query(CurrencyMaster).filter(CurrencyMaster.code == data.code).first():
        raise HTTPException(status_code=400, detail="Currency already exists")
    new_item = CurrencyMaster(code=data.code, rate=data.rate)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/currencies/{id}")
async def update_currency(id: int, data: CurrencyUpdate, db: Session = Depends(get_db)):
    item = db.query(CurrencyMaster).filter(CurrencyMaster.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Currency not found")
        
    item.code = data.code
    item.rate = data.rate
    db.commit()
    return {"status": "success"}

@router.delete("/currencies/{id}")
async def delete_currency(id: int, db: Session = Depends(get_db)):
    item = db.query(CurrencyMaster).filter(CurrencyMaster.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Currency not found")
    
    # Prevent deleting INR
    if item.code == 'INR':
         raise HTTPException(status_code=400, detail="Cannot delete base currency INR")
         
    db.delete(item)
    db.commit()
    return {"status": "success"}
