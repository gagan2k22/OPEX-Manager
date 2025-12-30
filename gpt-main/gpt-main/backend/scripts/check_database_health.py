"""
backend/scripts/check_database_health.py
Database health check and cleanup utility
"""
import sqlite3
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import inspect, text

def check_database_health():
    """Check database for issues and report findings"""
    
    print("=" * 80)
    print("DATABASE HEALTH CHECK")
    print("=" * 80)
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"\n📊 Total Tables: {len(tables)}\n")
    
    # Expected tables (snake_case)
    expected_tables = {
        'users', 'roles', 'user_roles',
        'service_master', 'fy_financials',
        'entity_master', 'tower_master', 'budget_head_master',
        'po_entity_master', 'allocation_type_master', 'allocation_basis_master'
    }
    
    # Check for duplicate naming patterns
    print("🔍 Checking for duplicate tables...\n")
    
    found_tables = set(tables)
    duplicates = []
    
    # Check for PascalCase duplicates
    pascal_case_tables = {
        'User', 'Role', 'UserRole',
        'ServiceMaster', 'FYFinancials',
        'EntityMaster', 'TowerMaster', 'BudgetHeadMaster',
        'POEntityMaster', 'AllocationTypeMaster', 'AllocationBasisMaster'
    }
    
    for pascal in pascal_case_tables:
        if pascal in found_tables:
            duplicates.append(pascal)
    
    if duplicates:
        print("⚠️  WARNING: Found PascalCase tables (potential duplicates):")
        for dup in duplicates:
            print(f"   - {dup}")
        print()
    else:
        print("✅ No duplicate PascalCase tables found\n")
    
    # Check table contents
    print("📋 Table Row Counts:\n")
    
    with engine.connect() as conn:
        for table in sorted(tables):
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                
                # Highlight tables with data
                if count > 0:
                    print(f"   ✓ {table:30s} {count:>6} rows")
                else:
                    print(f"   ○ {table:30s} {count:>6} rows (empty)")
                    
            except Exception as e:
                print(f"   ✗ {table:30s} ERROR: {str(e)}")
    
    print()
    
    # Check for missing expected tables
    missing = expected_tables - found_tables
    if missing:
        print("⚠️  WARNING: Missing expected tables:")
        for table in missing:
            print(f"   - {table}")
        print()
    else:
        print("✅ All expected tables present\n")
    
    # Check for indexes
    print("🔍 Checking indexes...\n")
    
    for table in ['service_master', 'fy_financials']:
        if table in tables:
            indexes = inspector.get_indexes(table)
            print(f"   {table}:")
            if indexes:
                for idx in indexes:
                    cols = ', '.join(idx['column_names'])
                    unique = ' (UNIQUE)' if idx['unique'] else ''
                    print(f"      - {idx['name']}: {cols}{unique}")
            else:
                print(f"      No indexes found")
            print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    issues = []
    
    if duplicates:
        issues.append(f"Found {len(duplicates)} duplicate PascalCase tables")
    
    if missing:
        issues.append(f"Missing {len(missing)} expected tables")
    
    if issues:
        print("\n⚠️  Issues Found:")
        for issue in issues:
            print(f"   - {issue}")
        print("\n💡 Recommendation: Run cleanup script to fix issues")
    else:
        print("\n✅ Database is healthy!")
    
    print("=" * 80)

def generate_cleanup_script():
    """Generate SQL cleanup script for duplicate tables"""
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    # PascalCase tables to remove
    pascal_case_tables = {
        'User', 'Role', 'UserRole',
        'ServiceMaster', 'FYFinancials',
        'EntityMaster', 'TowerMaster', 'BudgetHeadMaster',
        'POEntityMaster', 'AllocationTypeMaster', 'AllocationBasisMaster'
    }
    
    duplicates = [t for t in pascal_case_tables if t in tables]
    
    if not duplicates:
        print("\n✅ No cleanup needed - no duplicate tables found")
        return
    
    print("\n" + "=" * 80)
    print("CLEANUP SCRIPT")
    print("=" * 80)
    print("\n-- SQL commands to remove duplicate PascalCase tables\n")
    
    for table in duplicates:
        print(f"DROP TABLE IF EXISTS {table};")
    
    print("\n-- Run this script with caution!")
    print("-- Make sure to backup your database first")
    print("=" * 80)

if __name__ == "__main__":
    try:
        check_database_health()
        generate_cleanup_script()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
