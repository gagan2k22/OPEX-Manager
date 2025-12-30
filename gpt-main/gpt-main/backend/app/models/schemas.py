"""
backend/app/models/schemas.py
Database models for OPEX Manager
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # Admin, User, Viewer
    
    users = relationship("User", secondary="user_roles", back_populates="roles")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    roles = relationship("Role", secondary="user_roles", back_populates="users")

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)

class ServiceMaster(Base):
    __tablename__ = "service_master"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True)
    vendor = Column(String, index=True)
    service = Column(String)
    description = Column(Text)
    tower = Column(String, index=True)
    budget_head = Column(String, index=True)
    allocation_basis = Column(String, nullable=True) # e.g. "Employee Count", "Revenue"
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    remarks = Column(Text)
    
    # Extended fields
    parent_uid = Column(String, nullable=True)
    renewal_month = Column(DateTime, nullable=True)
    contract = Column(String, nullable=True)
    po_entity = Column(String, nullable=True)
    initiative_type = Column(String, nullable=True)
    service_type = Column(String, nullable=True)
    currency = Column(String, nullable=True) # Added currency column
    
    financials = relationship("FYFinancials", back_populates="service", cascade="all, delete-orphan")
    
    # Composite indexes for common query patterns
    __table_args__ = (
        # Index for vendor + tower queries
        # Index('idx_vendor_tower', 'vendor', 'tower'),
        # Index for budget_head queries with FY
        # Index('idx_budget_head', 'budget_head'),
    )

class FYFinancials(Base):
    __tablename__ = "fy_financials"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("service_master.id"))
    fy = Column(String, index=True) # FY2024
    budget = Column(Float, default=0.0)
    actuals = Column(Float, default=0.0)
    
    service = relationship("ServiceMaster", back_populates="financials")

class EntityMaster(Base):
    __tablename__ = "entity_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class TowerMaster(Base):
    __tablename__ = "tower_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class BudgetHeadMaster(Base):
    __tablename__ = "budget_head_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class POEntityMaster(Base):
    __tablename__ = "po_entity_master"
    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String, unique=True)

class AllocationTypeMaster(Base):
    __tablename__ = "allocation_type_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class AllocationBasisMaster(Base):
    __tablename__ = "allocation_basis_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class CurrencyMaster(Base):
    __tablename__ = "currency_master"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True) # USD, CAD, INR
    rate = Column(Float, default=1.0)  # Multiplier to convert TO INR


class ImportLog(Base):
    __tablename__ = "import_logs"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    type = Column(String)  # MASTER, BUDGET, PO, ACTUALS
    filename = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_rows = Column(Integer, default=0)
    accepted_rows = Column(Integer, default=0)
    rejected_rows = Column(Integer, default=0)
    status = Column(String)  # Completed, Failed, Partial
    error_details = Column(Text, nullable=True)

    user = relationship("User", backref="imports")

class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("service_master.id"))
    entity_name = Column(String, index=True)
    value = Column(Float, default=0.0)
    fy = Column(String, index=True)
    
    service = relationship("ServiceMaster", backref="allocations")

class BOARow(Base):
    __tablename__ = "boa_rows"
    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, index=True) # "Vendor / Service" or "Service"
    basis = Column(String)
    total_count = Column(Float, default=0.0)
    fy = Column(String, index=True)
    
    values = relationship("BOAValue", backref="row", cascade="all, delete-orphan")

class BOAValue(Base):
    __tablename__ = "boa_values"
    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(Integer, ForeignKey("boa_rows.id"))
    entity = Column(String)
    value = Column(Float, default=0.0)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g. "LOGIN", "UPDATE_BUDGET"
    details = Column(String)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
    
    user = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    table_name = Column(String) # e.g. "service_master"
    record_id = Column(Integer)
    field_name = Column(String)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())
    
    user = relationship("User")

