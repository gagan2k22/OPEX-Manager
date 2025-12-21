---
description: Testing Budget Import Feature
---

# Testing Budget Import with Field Mapping

## Test Checklist

### 1. Basic Upload Test
- [ ] Navigate to Budget Tracker page
- [ ] Click "Upload Budget" button
- [ ] Verify modal opens with stepper showing 3 steps
- [ ] Upload a sample Excel file
- [ ] Verify file name and size display
- [ ] Click "Initialize Mapping"
- [ ] Verify progression to Step 2

### 2. Field Mapping Test
- [ ] Verify all Excel headers are listed
- [ ] Check auto-detected mappings are correct
- [ ] Test changing a mapping via dropdown
- [ ] Test skipping a column (set to empty)
- [ ] Verify status icons (checkmark for mapped, warning for skipped)
- [ ] Click "Update Preview"
- [ ] Verify progression to Step 3

### 3. Preview & Validation Test
- [ ] Verify summary cards show correct counts
- [ ] Check rejected rows table (if any)
- [ ] Download rejected rows CSV
- [ ] Review accepted rows preview
- [ ] Verify vendor names are displayed
- [ ] Click "Commit Import"
- [ ] Verify success message

### 4. New Fields Test
Create an Excel file with these columns:
- UID
- Description
- Vendor Name (NEW - should be imported)
- Renewal Date (NEW - should be imported)
- Allocation Type (NEW - should be imported)
- Initiative Type (NEW - should be imported)
- FY26 Budget (should map to Total)
- Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar

**Expected Results**:
- All new fields should be recognized
- Vendor Name should populate vendorId
- Renewal Date should be stored as DateTime
- Allocation Type should be stored as string
- Initiative Type should be stored as string
- FY26 Budget should map to totalBudget

### 5. Custom Mapping Test
Create an Excel with non-standard headers:
- "Unique ID" → should map to UID
- "Service Description" → should map to Description
- "Supplier" → manually map to Vendor Name
- "Contract Renewal" → manually map to Renewal Date

**Expected Results**:
- Auto-detection should work for close matches
- Manual mapping should override auto-detection
- Custom mappings should persist through preview

### 6. Error Handling Test
Create an Excel with errors:
- Row with missing UID
- Row with invalid date
- Row with non-numeric amount
- Row with total mismatch

**Expected Results**:
- All errors should appear in rejected rows
- Error messages should be clear
- Download rejected CSV should work
- Valid rows should still be accepted

### 7. Back Navigation Test
- [ ] Upload file and go to Step 2
- [ ] Click "Back" button
- [ ] Verify return to Step 1
- [ ] Verify file is still selected
- [ ] Go to Step 3
- [ ] Click "Back" button
- [ ] Verify return to Step 2
- [ ] Verify mappings are preserved

### 8. Cancel & Reset Test
- [ ] Upload file and configure mappings
- [ ] Click "Cancel"
- [ ] Verify modal closes
- [ ] Re-open modal
- [ ] Verify state is reset (Step 1, no file)

## Sample Excel Template

Create a file named `budget_import_test.xlsx` with these columns:

| UID | Description | Tower | Budget Head | Vendor Name | Start Date | End Date | Renewal Date | Allocation Type | Initiative Type | Priority | FY26 Budget | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Jan | Feb | Mar |
|-----|-------------|-------|-------------|-------------|------------|----------|--------------|-----------------|-----------------|----------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| DIT-OPEX FY25-001 | Cloud Services | DIT | Infrastructure | AWS | 2024-04-01 | 2025-03-31 | 2025-03-31 | Shared | Existing | High | 1200000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 | 100000 |
| DIT-OPEX FY25-002 | Software Licenses | DIT | Software | Microsoft | 2024-04-01 | 2025-03-31 | 2025-04-01 | Dedicated | New | Medium | 600000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 | 50000 |

## Expected Database Changes

After successful import, verify in database:
```sql
SELECT 
  uid, 
  description, 
  vendorId, 
  renewalDate, 
  allocationType, 
  initiativeType, 
  priority,
  totalBudget
FROM LineItem 
WHERE uid LIKE 'DIT-OPEX FY25-%'
ORDER BY uid;
```

**Expected**:
- vendorId should be populated (not null)
- renewalDate should be a valid DateTime
- allocationType should be 'Shared' or 'Dedicated'
- initiativeType should be 'Existing' or 'New'
- priority should be 'High' or 'Medium'
- totalBudget should match sum of months

## Performance Test

Test with larger files:
- [ ] 100 rows - should complete in < 5 seconds
- [ ] 500 rows - should complete in < 15 seconds
- [ ] 1000 rows - should complete in < 30 seconds

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Edge
- [ ] Firefox

## Regression Tests

Ensure existing functionality still works:
- [ ] Budget Tracker page loads
- [ ] Export Budget works
- [ ] Filters work
- [ ] DataGrid sorting/filtering works
- [ ] Create Budget manually works
