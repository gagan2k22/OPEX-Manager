---
description: Guide for Budget Import with Field Mapping
---

# Budget Import with Custom Field Mapping

## Overview
The Budget Import feature now supports a **3-step wizard** that allows users to:
1. Upload Excel files
2. Map Excel headers to application fields
3. Preview and commit the import

## Supported Fields

### Core Fields
- **UID** (Required) - Unique identifier for the line item
- **Parent UID** - For hierarchical grouping
- **Description** - Service description
- **Tower** - Business tower/department
- **Budget Head** - Budget category

### Vendor & Contract Information
- **Vendor Name** - Vendor/supplier name
- **Start Date** - Service start date
- **End Date** - Service end date
- **Renewal Date** - Contract renewal date (NEW)
- **Contract/PO ID** - Contract or PO number
- **Has Contract** - Boolean flag

### Classification Fields
- **PO Entity** - Purchase order entity
- **Allocation Basis** - How costs are allocated
- **Allocation Type** - Dedicated/Shared (NEW)
- **Service Type** - Type of service
- **Initiative Type** - New/Existing (NEW)
- **Priority** - Priority level (NEW)

### Budget Amounts
- **Total Budget** - Total amount (or FY26 Budget, FY27 Budget, etc.)
- **Monthly Columns** - Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar

## Import Process

### Step 1: Upload
1. Navigate to Budget Tracker page
2. Click "Upload Budget" button
3. Drag & drop or browse to select Excel file (.xlsx, .xls)
4. Click "Initialize Mapping"

### Step 2: Field Mapping
The system will:
- Auto-detect headers using fuzzy matching
- Display a mapping table with all Excel headers
- Allow you to adjust mappings via dropdown menus

**Actions:**
- Review each Excel header
- Select the corresponding application field from dropdown
- Skip unwanted columns by selecting "Skip this column"
- Click "Update Preview" to validate mappings

### Step 3: Preview & Commit
The system shows:
- **Summary Cards**: Total rows, Accepted rows, Rejected rows
- **Rejected Rows Table**: Shows validation errors
- **Accepted Rows Preview**: Shows sample of valid data

**Actions:**
- Review rejected rows and download error report if needed
- Click "Commit Import" to finalize the import

## Fuzzy Header Matching

The system automatically recognizes variations of headers:

| Application Field | Recognized Headers |
|------------------|-------------------|
| UID | uid, UID, Uid, unique id |
| Vendor Name | vendor, vendor name, vendor_name |
| Renewal Date | renewal date, renewal_date, renewal |
| Allocation Type | allocation type, allocation_type, alloc type |
| Initiative Type | initiative type, initiative_type, initiative |
| Total Budget | total, total budget, grand total, FY26 Budget, FY27 Budget |

## Custom Mapping

If your Excel headers don't match the standard patterns:
1. The system will show them in Step 2
2. Manually select the correct application field
3. The mapping will be saved for the current import session

## Validation Rules

The import validates:
- ✅ UID is required and must be unique
- ✅ Monthly amounts must be numeric
- ✅ Total budget should match sum of months (tolerance: ±0.5)
- ✅ Dates must be valid date formats
- ✅ Master data references (Tower, Budget Head, Vendor) must exist

## Error Handling

**Rejected Rows** will show:
- Row number in Excel
- UID (if present)
- List of validation errors

**Download Rejected Rows** as CSV to:
- Fix issues in Excel
- Re-upload corrected file

## Tips for Best Results

1. **Use Standard Headers**: Stick to recognized header names when possible
2. **Include UID Column**: Always required for tracking
3. **Validate Master Data**: Ensure Towers, Budget Heads, Vendors exist in system
4. **Check Totals**: Verify monthly amounts sum to total budget
5. **Date Formats**: Use Excel date formats (not text)
6. **Review Mapping**: Always check Step 2 mapping before proceeding

## Troubleshooting

**Issue**: Column not detected
- **Solution**: Use custom mapping in Step 2

**Issue**: Vendor/Tower not found
- **Solution**: Add master data first, then re-import

**Issue**: Total mismatch error
- **Solution**: Ensure sum of monthly columns equals total column

**Issue**: Invalid date format
- **Solution**: Format cells as Date in Excel

## API Details

**Endpoint**: `POST /api/budgets/import`

**Form Data**:
- `file`: Excel file (multipart/form-data)
- `dryRun`: 'true' | 'false'
- `customMapping`: JSON string of header mappings

**Response** (Dry Run):
```json
{
  "dryRun": true,
  "report": {
    "totalRows": 100,
    "accepted": [...],
    "rejected": [...]
  },
  "headerMapping": {
    "rawHeaders": ["UID", "Service Desc", ...],
    "normalizedHeaders": ["UID", "Description", ...],
    "fieldMap": {
      "Service Desc": "description",
      ...
    }
  }
}
```

**Response** (Commit):
```json
{
  "success": true,
  "imported": 95,
  "details": [...]
}
```
