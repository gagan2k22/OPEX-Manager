-- Performance Optimization Indexes for Large Scale Deployment
-- Run this migration after switching to PostgreSQL
-- These indexes will significantly improve query performance for 500-2000 users

-- ============================================
-- ServiceMaster Indexes
-- ============================================

-- Index for vendor filtering and searches
CREATE INDEX IF NOT EXISTS idx_service_master_vendor 
ON "ServiceMaster"(vendor) 
WHERE vendor IS NOT NULL;

-- Index for tower-based filtering
CREATE INDEX IF NOT EXISTS idx_service_master_tower 
ON "ServiceMaster"(tower) 
WHERE tower IS NOT NULL;

-- Index for budget head filtering
CREATE INDEX IF NOT EXISTS idx_service_master_budget_head 
ON "ServiceMaster"(budget_head) 
WHERE budget_head IS NOT NULL;

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_service_master_dates 
ON "ServiceMaster"(service_start_date, service_end_date) 
WHERE service_start_date IS NOT NULL;

-- Index for UID lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_service_master_uid 
ON "ServiceMaster"(uid);

-- Index for service type filtering
CREATE INDEX IF NOT EXISTS idx_service_master_service_type 
ON "ServiceMaster"(service_type) 
WHERE service_type IS NOT NULL;

-- Index for initiative type filtering
CREATE INDEX IF NOT EXISTS idx_service_master_initiative_type 
ON "ServiceMaster"(initiative_type) 
WHERE initiative_type IS NOT NULL;

-- ============================================
-- MonthlyEntityActual Indexes
-- ============================================

-- Composite index for service-month aggregations (most common query)
CREATE INDEX IF NOT EXISTS idx_monthly_actual_service_month 
ON "MonthlyEntityActual"(service_id, month_no);

-- Composite index for entity-month aggregations
CREATE INDEX IF NOT EXISTS idx_monthly_actual_entity_month 
ON "MonthlyEntityActual"(entity_id, month_no);

-- Index for amount-based queries and aggregations
CREATE INDEX IF NOT EXISTS idx_monthly_actual_amount 
ON "MonthlyEntityActual"(amount) 
WHERE amount > 0;

-- Composite index for service-entity lookups
CREATE INDEX IF NOT EXISTS idx_monthly_actual_service_entity 
ON "MonthlyEntityActual"(service_id, entity_id);

-- ============================================
-- FYActual Indexes
-- ============================================

-- Composite index for FY-based queries
CREATE INDEX IF NOT EXISTS idx_fy_actual_service_fy 
ON "FYActual"(service_id, financial_year);

-- Index for financial year filtering
CREATE INDEX IF NOT EXISTS idx_fy_actual_year 
ON "FYActual"(financial_year);

-- Index for budget vs actual analysis
CREATE INDEX IF NOT EXISTS idx_fy_actual_budget 
ON "FYActual"(fy_budget) 
WHERE fy_budget > 0;

-- ============================================
-- ProcurementDetail Indexes
-- ============================================

-- Index for service-based procurement lookups
CREATE INDEX IF NOT EXISTS idx_procurement_service 
ON "ProcurementDetail"(service_id);

-- Index for PO number searches
CREATE INDEX IF NOT EXISTS idx_procurement_po_number 
ON "ProcurementDetail"(po_number) 
WHERE po_number IS NOT NULL;

-- Index for PR number searches
CREATE INDEX IF NOT EXISTS idx_procurement_pr_number 
ON "ProcurementDetail"(pr_number) 
WHERE pr_number IS NOT NULL;

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_procurement_dates 
ON "ProcurementDetail"(po_date, pr_date);

-- ============================================
-- ServiceEntityAllocation Indexes
-- ============================================

-- Composite index for service-entity allocations (most common join)
CREATE INDEX IF NOT EXISTS idx_service_entity_alloc 
ON "ServiceEntityAllocation"(service_id, entity_id);

-- Index for entity-based allocation queries
CREATE INDEX IF NOT EXISTS idx_service_entity_entity 
ON "ServiceEntityAllocation"(entity_id);

-- Index for count-based queries
CREATE INDEX IF NOT EXISTS idx_service_entity_count 
ON "ServiceEntityAllocation"(count) 
WHERE count > 0;

-- ============================================
-- AllocationBasis Indexes
-- ============================================

-- Index for service-based allocation lookups
CREATE INDEX IF NOT EXISTS idx_allocation_basis_service 
ON "AllocationBasis"(service_id);

-- Index for basis type filtering
CREATE INDEX IF NOT EXISTS idx_allocation_basis_type 
ON "AllocationBasis"(basis_of_allocation) 
WHERE basis_of_allocation IS NOT NULL;

-- ============================================
-- User Activity Log Indexes
-- ============================================

-- Index for timestamp-based queries (most recent activities)
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp 
ON "UserActivityLog"(timestamp DESC);

-- Composite index for user activity history
CREATE INDEX IF NOT EXISTS idx_activity_log_user 
ON "UserActivityLog"(user_id, timestamp DESC) 
WHERE user_id IS NOT NULL;

-- Index for action-based filtering
CREATE INDEX IF NOT EXISTS idx_activity_log_action 
ON "UserActivityLog"(action);

-- ============================================
-- Audit Log Indexes
-- ============================================

-- Composite index for entity-based audit trails
CREATE INDEX IF NOT EXISTS idx_audit_log_entity 
ON "AuditLog"(entityType, entityId);

-- Index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created 
ON "AuditLog"(createdAt DESC);

-- Index for user-based audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON "AuditLog"(userId, createdAt DESC);

-- ============================================
-- Import History Indexes
-- ============================================

-- Index for import type filtering
CREATE INDEX IF NOT EXISTS idx_import_history_type 
ON "ImportHistory"(type);

-- Index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_import_history_created 
ON "ImportHistory"(createdAt DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_import_history_status 
ON "ImportHistory"(status);

-- ============================================
-- Currency Rate Indexes
-- ============================================

-- Composite index for currency pair lookups
CREATE INDEX IF NOT EXISTS idx_currency_rate_pair 
ON "CurrencyRate"(from_currency, to_currency);

-- Index for effective date queries
CREATE INDEX IF NOT EXISTS idx_currency_rate_date 
ON "CurrencyRate"(effective_date DESC);

-- ============================================
-- User and Role Indexes
-- ============================================

-- Index for email-based user lookups
CREATE INDEX IF NOT EXISTS idx_user_email 
ON "User"(email);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_user_active 
ON "User"(is_active) 
WHERE is_active = true;

-- Index for role name lookups
CREATE INDEX IF NOT EXISTS idx_role_name 
ON "Role"(name);

-- ============================================
-- ServiceRemarkLog Indexes
-- ============================================

-- Index for service-based remark lookups
CREATE INDEX IF NOT EXISTS idx_remark_log_service 
ON "ServiceRemarkLog"(service_id);

-- Index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_remark_log_created 
ON "ServiceRemarkLog"(createdAt DESC);

-- ============================================
-- Analyze tables for query planner
-- ============================================

ANALYZE "ServiceMaster";
ANALYZE "MonthlyEntityActual";
ANALYZE "FYActual";
ANALYZE "ProcurementDetail";
ANALYZE "ServiceEntityAllocation";
ANALYZE "AllocationBasis";
ANALYZE "UserActivityLog";
ANALYZE "AuditLog";
ANALYZE "ImportHistory";
ANALYZE "CurrencyRate";
ANALYZE "User";
ANALYZE "Role";
ANALYZE "ServiceRemarkLog";

-- ============================================
-- Vacuum tables for optimal performance
-- ============================================

VACUUM ANALYZE "ServiceMaster";
VACUUM ANALYZE "MonthlyEntityActual";
VACUUM ANALYZE "FYActual";
VACUUM ANALYZE "ProcurementDetail";
VACUUM ANALYZE "ServiceEntityAllocation";

-- End of performance indexes migration
