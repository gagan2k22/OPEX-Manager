-- ============================================
-- OPEX Management System - MySQL Database Schema
-- Version: 1.0
-- Database: MySQL 8.0+
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS opex_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE opex_db;

-- ============================================
-- User & Authentication Tables
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Viewer, Editor, Approver, Admin',
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Master Data Tables
-- ============================================

CREATE TABLE towers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_tower_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budget_heads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tower_id INT NOT NULL,
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
    INDEX idx_tower_id (tower_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    contact_person VARCHAR(255),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cost_centres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE po_entities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Shared Service, Dedicated Service'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE allocation_basis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fiscal_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Budget & Line Items
-- ============================================

CREATE TABLE line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(100) NOT NULL,
    parent_uid VARCHAR(100),
    description TEXT NOT NULL,
    tower_id INT,
    budget_head_id INT,
    cost_centre_id INT,
    fiscal_year_id INT,
    vendor_id INT,
    service_start_date DATE,
    service_end_date DATE,
    contract_id VARCHAR(100),
    po_entity_id INT,
    allocation_basis_id INT,
    service_type_id INT,
    total_budget DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    remarks TEXT,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- New fields
    renewal_date DATE,
    initiative_type VARCHAR(50) COMMENT 'New / Existing',
    priority VARCHAR(50),
    cost_optimization_lever VARCHAR(50) COMMENT 'Avoidance / Optimization',
    allocation_type VARCHAR(50) COMMENT 'Dedicated / Shared',
    has_contract BOOLEAN DEFAULT FALSE,
    is_shared_service BOOLEAN DEFAULT FALSE,
    -- Foreign Keys
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL,
    FOREIGN KEY (budget_head_id) REFERENCES budget_heads(id) ON DELETE SET NULL,
    FOREIGN KEY (cost_centre_id) REFERENCES cost_centres(id) ON DELETE SET NULL,
    FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (po_entity_id) REFERENCES po_entities(id) ON DELETE SET NULL,
    FOREIGN KEY (allocation_basis_id) REFERENCES allocation_basis(id) ON DELETE SET NULL,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL,
    -- Indexes
    INDEX idx_uid (uid),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_fiscal_year_id (fiscal_year_id),
    INDEX idx_budget_head_id (budget_head_id),
    INDEX idx_tower_id (tower_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budget_months (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_item_id INT NOT NULL,
    month VARCHAR(20) NOT NULL COMMENT 'Jan, Feb, Mar, etc.',
    amount DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE KEY unique_lineitem_month (line_item_id, month),
    FOREIGN KEY (line_item_id) REFERENCES line_items(id) ON DELETE CASCADE,
    INDEX idx_line_item_id (line_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Purchase Orders
-- ============================================

CREATE TABLE pos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number INT UNIQUE NOT NULL,
    po_date DATE NOT NULL,
    pr_number INT,
    pr_date DATE,
    pr_amount DECIMAL(15, 2),
    vendor_id INT,
    currency VARCHAR(10) DEFAULT 'INR',
    po_value DECIMAL(15, 2) NOT NULL,
    exchange_rate DECIMAL(10, 4),
    common_currency_value DECIMAL(15, 2),
    value_in_lac DECIMAL(15, 2),
    status VARCHAR(50),
    tower_id INT,
    budget_head_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL,
    FOREIGN KEY (budget_head_id) REFERENCES budget_heads(id) ON DELETE SET NULL,
    INDEX idx_po_number (po_number),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE po_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    line_item_id INT NOT NULL,
    allocated_amount DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE KEY unique_po_lineitem (po_id, line_item_id),
    FOREIGN KEY (po_id) REFERENCES pos(id) ON DELETE CASCADE,
    FOREIGN KEY (line_item_id) REFERENCES line_items(id) ON DELETE CASCADE,
    INDEX idx_po_id (po_id),
    INDEX idx_line_item_id (line_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Actuals
-- ============================================

CREATE TABLE actuals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(100),
    invoice_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    converted_amount DECIMAL(15, 2),
    line_item_id INT,
    month VARCHAR(20) COMMENT 'Jan, Feb, Mar, etc.',
    vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_item_id) REFERENCES line_items(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    INDEX idx_line_item_id (line_item_id),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_vendor_id (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOA (Basis of Allocation) Tables
-- ============================================

CREATE TABLE budget_boas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiscal_year INT NOT NULL,
    tower_id INT NOT NULL,
    budget_head_id INT NOT NULL,
    cost_centre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_budget_boa (fiscal_year, tower_id, budget_head_id, cost_centre_id),
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_head_id) REFERENCES budget_heads(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_centre_id) REFERENCES cost_centres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budget_boa_months (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_boa_id INT NOT NULL,
    month INT NOT NULL COMMENT '1-12',
    budget_amount DECIMAL(15, 2) DEFAULT 0.00,
    UNIQUE KEY unique_boa_month (budget_boa_id, month),
    FOREIGN KEY (budget_boa_id) REFERENCES budget_boas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE actuals_boas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiscal_year INT NOT NULL,
    month INT NOT NULL COMMENT '1-12',
    tower_id INT NOT NULL,
    budget_head_id INT NOT NULL,
    cost_centre_id INT NOT NULL,
    actual_amount DECIMAL(15, 2) NOT NULL,
    remarks TEXT,
    basis_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_head_id) REFERENCES budget_heads(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_centre_id) REFERENCES cost_centres(id) ON DELETE CASCADE,
    FOREIGN KEY (basis_id) REFERENCES allocation_basis(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE actuals_calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_boa_id INT NOT NULL,
    actuals_boa_id INT NOT NULL,
    variance_amount DECIMAL(15, 2) NOT NULL,
    variance_percentage DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_boa_id) REFERENCES budget_boas(id) ON DELETE CASCADE,
    FOREIGN KEY (actuals_boa_id) REFERENCES actuals_boas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE budget_boa_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_service VARCHAR(255) NOT NULL,
    basis_of_allocation VARCHAR(255),
    total_count INT DEFAULT 0,
    jpm_corporate INT DEFAULT 0,
    jphi_corporate INT DEFAULT 0,
    biosys_bengaluru INT DEFAULT 0,
    biosys_noida INT DEFAULT 0,
    biosys_greater_noida INT DEFAULT 0,
    pharmova_api INT DEFAULT 0,
    jgl_dosage INT DEFAULT 0,
    jgl_ibp INT DEFAULT 0,
    cadista_dosage INT DEFAULT 0,
    jdi_radio_pharmaceuticals INT DEFAULT 0,
    jdi_radiopharmacies INT DEFAULT 0,
    jhs_gp_cmo INT DEFAULT 0,
    jhs_llc_cmo INT DEFAULT 0,
    jhs_llc_allergy INT DEFAULT 0,
    ingrevia INT DEFAULT 0,
    jil_jacpl INT DEFAULT 0,
    jfl INT DEFAULT 0,
    consumer INT DEFAULT 0,
    jti INT DEFAULT 0,
    jogpl INT DEFAULT 0,
    enpro INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE actual_boa_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_service VARCHAR(255) NOT NULL,
    fiscal_year VARCHAR(50) NOT NULL,
    basis_of_allocation VARCHAR(255),
    total_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Audit & Logging Tables
-- ============================================

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity VARCHAR(100) NOT NULL,
    entity_id INT,
    action VARCHAR(50) NOT NULL,
    user_id INT,
    diff JSON COMMENT 'JSON object containing changes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entity (entity),
    INDEX idx_entity_id (entity_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(255),
    action VARCHAR(255) NOT NULL COMMENT 'HTTP Method + URL',
    details TEXT COMMENT 'Request body or query params',
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE currency_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(10, 4) NOT NULL,
    effective_date DATE NOT NULL,
    updated_by_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_pair (from_currency, to_currency),
    FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_currency_pair (from_currency, to_currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Import & Export Tables
-- ============================================

CREATE TABLE import_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    rows_total INT NOT NULL,
    rows_accepted INT NOT NULL,
    rows_rejected INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    import_type VARCHAR(50) NOT NULL COMMENT 'budgets, actuals',
    metadata JSON COMMENT 'Additional import metadata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_import_type (import_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    filters JSON NOT NULL COMMENT 'Saved filter configuration',
    page VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_view (user_id, name, page),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reconciliation_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_item_id INT NOT NULL,
    actual_id INT,
    note TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_item_id) REFERENCES line_items(id) ON DELETE CASCADE,
    FOREIGN KEY (actual_id) REFERENCES actuals(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_line_item_id (line_item_id),
    INDEX idx_actual_id (actual_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Initial Data Seeding
-- ============================================

-- Insert default roles
INSERT INTO roles (name) VALUES 
('Admin'),
('Approver'),
('Editor'),
('Viewer');

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (name, email, password_hash, is_active) VALUES 
('Admin User', 'admin@example.com', '$2a$10$YourHashedPasswordHere', TRUE);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@example.com' AND r.name = 'Admin';

-- Insert sample fiscal year
INSERT INTO fiscal_years (name, start_date, end_date, is_active) VALUES 
('FY2025', '2025-04-01', '2026-03-31', TRUE);

-- Insert sample service types
INSERT INTO service_types (name) VALUES 
('Shared Service'),
('Dedicated Service');

-- ============================================
-- Stored Procedures & Functions (Optional)
-- ============================================

DELIMITER //

-- Function to calculate budget utilization percentage
CREATE FUNCTION calculate_utilization(
    p_line_item_id INT
) RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_budget DECIMAL(15, 2);
    DECLARE v_actuals DECIMAL(15, 2);
    DECLARE v_utilization DECIMAL(10, 2);
    
    SELECT total_budget INTO v_budget 
    FROM line_items 
    WHERE id = p_line_item_id;
    
    SELECT COALESCE(SUM(converted_amount), 0) INTO v_actuals 
    FROM actuals 
    WHERE line_item_id = p_line_item_id;
    
    IF v_budget > 0 THEN
        SET v_utilization = (v_actuals / v_budget) * 100;
    ELSE
        SET v_utilization = 0;
    END IF;
    
    RETURN v_utilization;
END //

-- Procedure to get dashboard statistics
CREATE PROCEDURE get_dashboard_stats(
    IN p_fiscal_year_id INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT li.id) as total_line_items,
        COALESCE(SUM(li.total_budget), 0) as total_budget,
        COALESCE(SUM(a.converted_amount), 0) as total_actuals,
        COUNT(DISTINCT p.id) as total_pos,
        COALESCE(SUM(p.po_value), 0) as total_po_value
    FROM line_items li
    LEFT JOIN actuals a ON li.id = a.line_item_id
    LEFT JOIN pos p ON li.tower_id = p.tower_id
    WHERE li.fiscal_year_id = p_fiscal_year_id;
END //

DELIMITER ;

-- ============================================
-- Views for Common Queries
-- ============================================

-- Budget vs Actuals Summary View
CREATE OR REPLACE VIEW v_budget_actuals_summary AS
SELECT 
    li.id,
    li.uid,
    li.description,
    t.name as tower_name,
    bh.name as budget_head_name,
    v.name as vendor_name,
    li.total_budget,
    COALESCE(SUM(a.converted_amount), 0) as total_actuals,
    (li.total_budget - COALESCE(SUM(a.converted_amount), 0)) as variance,
    CASE 
        WHEN li.total_budget > 0 THEN 
            (COALESCE(SUM(a.converted_amount), 0) / li.total_budget) * 100
        ELSE 0 
    END as utilization_percentage
FROM line_items li
LEFT JOIN towers t ON li.tower_id = t.id
LEFT JOIN budget_heads bh ON li.budget_head_id = bh.id
LEFT JOIN vendors v ON li.vendor_id = v.id
LEFT JOIN actuals a ON li.id = a.line_item_id
GROUP BY li.id;

-- PO Summary View
CREATE OR REPLACE VIEW v_po_summary AS
SELECT 
    p.id,
    p.po_number,
    p.po_date,
    v.name as vendor_name,
    p.po_value,
    p.currency,
    p.status,
    COUNT(pli.id) as line_item_count,
    COALESCE(SUM(pli.allocated_amount), 0) as total_allocated
FROM pos p
LEFT JOIN vendors v ON p.vendor_id = v.id
LEFT JOIN po_line_items pli ON p.id = pli.po_id
GROUP BY p.id;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_line_items_fiscal_tower ON line_items(fiscal_year_id, tower_id);
CREATE INDEX idx_actuals_date_vendor ON actuals(invoice_date, vendor_id);
CREATE INDEX idx_pos_date_status ON pos(po_date, status);

-- ============================================
-- Database Optimization Settings
-- ============================================

-- Set InnoDB buffer pool size (adjust based on available RAM)
-- SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB

-- Enable query cache (if using MySQL < 8.0)
-- SET GLOBAL query_cache_size = 67108864; -- 64MB
-- SET GLOBAL query_cache_type = 1;

-- ============================================
-- Backup & Maintenance
-- ============================================

-- Regular backup command (run from shell):
-- mysqldump -u root -p opex_db > opex_db_backup_$(date +%Y%m%d).sql

-- Optimize tables (run periodically):
-- OPTIMIZE TABLE line_items, actuals, pos, budget_months;

-- ============================================
-- End of Schema
-- ============================================

SELECT 'Database schema created successfully!' as status;
