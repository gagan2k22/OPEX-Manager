# Schema Data Type Updates

## Summary
Updated the Prisma schema to match the user's requested data types for better data integrity and alignment with business requirements.

## Changes Made

### 1. **PO Model** (Purchase Orders)
- **poNumber**: Changed from `String` to `Int` (unique)
- **prNumber**: Changed from `String?` to `Int?`
- **Rationale**: PO and PR numbers are numeric identifiers

### 2. **LineItem Model** (Budget Line Items)
Added two new boolean fields:
- **hasContract**: `Boolean?` @default(false) - Indicates if a contract exists
- **isSharedService**: `Boolean?` @default(false) - Indicates if service is shared

**Note**: The existing `contractId` (String) and `serviceTypeId` (Int relation) remain for detailed tracking, while these booleans provide quick yes/no flags.

### 3. **BudgetBOAData Model** (NEW)
Created comprehensive model for Budget Basis of Allocation with all entity columns as integers:
- `vendor_service`: String (identifier)
- `basis_of_allocation`: String? (allocation method)
- `total_count`: Int? (total allocation count)
- **Entity Columns** (all Int? with @default(0)):
  - `jpm_corporate`
  - `jphi_corporate`
  - `biosys_bengaluru`
  - `biosys_noida`
  - `biosys_greater_noida`
  - `pharmova_api`
  - `jgl_dosage`
  - `jgl_ibp`
  - `cadista_dosage`
  - `jdi_radio_pharmaceuticals`
  - `jdi_radiopharmacies`
  - `jhs_gp_cmo`
  - `jhs_llc_cmo`
  - `jhs_llc_allergy`
  - `ingrevia`
  - `jil_jacpl`
  - `jfl`
  - `consumer`
  - `jti`
  - `jogpl`
  - `enpro`

## Migration Status
✅ Migration created: `update_schema_datatypes`
⚠️ Prisma generate pending (requires app restart due to file locks)

## Next Steps
1. **Stop all running instances** of the application
2. Run `npx prisma generate` in the server directory
3. **Update existing data** if needed:
   - PO numbers: Convert string PO/PR numbers to integers
   - Contract flags: Set `hasContract` based on `contractId` presence
   - Service type flags: Set `isSharedService` based on `serviceTypeId`
4. Restart the application

## Data Type Reference (User Requirements)
| Field | Requested Type | Implementation |
|-------|---------------|----------------|
| UID | Char+Num | String ✓ |
| Parent UID | Char+Num | String ✓ |
| Vendor | char | String (relation) ✓ |
| Service Description | char | String ✓ |
| Service Start Date | date | DateTime ✓ |
| Service End Date | date | DateTime ✓ |
| Renewal Date | date | DateTime ✓ |
| Budget Head | Char | String (relation) ✓ |
| Tower | Char | String (relation) ✓ |
| Contract | boolean | Boolean (hasContract) ✓ |
| Allocation Basis | char | String (relation) ✓ |
| Service Type | boolean | Boolean (isSharedService) ✓ |
| PO Entity | Char | String (relation) ✓ |
| PR Number | int | Int? ✓ |
| PR Date | date | DateTime ✓ |
| PR Amount | float | Float ✓ |
| Currency | float | String (currency code) |
| PO Number | int | Int ✓ |
| PO Date | date | DateTime ✓ |
| Allocation Type | char | String ✓ |
| Total Count | int | Int ✓ |
| Entity Columns | int | Int ✓ |

## Notes
- Currency is stored as String (e.g., "INR", "USD") rather than Float, as it represents a currency code
- Existing relations (Vendor, Tower, BudgetHead, etc.) remain as foreign key integers with String names in related tables
- Boolean fields added for quick filtering while maintaining detailed relational data
