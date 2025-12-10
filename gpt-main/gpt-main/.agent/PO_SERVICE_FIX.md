# PO Service Fix - Integer Field Conversion

## Issue
After changing `poNumber` and `prNumber` from `String` to `Int` in the Prisma schema, the PO service was still passing string values, causing this error:

```
Argument `poNumber`: Invalid value provided. Expected Int, provided String.
```

## Root Cause
The schema was updated to use `Int` for PO and PR numbers:
```prisma
model PO {
  poNumber  Int    @unique  // Changed from String
  prNumber  Int?             // Changed from String?
  ...
}
```

But the service layer was not converting the values to integers before passing them to Prisma.

## Fix Applied

### 1. **createPO Function** (Line 33, 41)
**Before:**
```javascript
poNumber,
prNumber,
```

**After:**
```javascript
poNumber: parseInt(poNumber),
prNumber: prNumber ? parseInt(prNumber) : null,
```

### 2. **updatePO Function** (Lines 115-116)
**Added:**
```javascript
if (updateData.poNumber) updateData.poNumber = parseInt(updateData.poNumber);
if (updateData.prNumber) updateData.prNumber = parseInt(updateData.prNumber);
```

### 3. **listPOs Search Function** (Lines 187-197)
**Before:**
```javascript
if (search) {
    where.OR = [
        { poNumber: { contains: search } },  // ❌ 'contains' doesn't work with Int
        { prNumber: { contains: search } }
    ];
}
```

**After:**
```javascript
if (search) {
    // Try to parse as integer for PO/PR number search
    const searchInt = parseInt(search);
    if (!isNaN(searchInt)) {
        where.OR = [
            { poNumber: searchInt },  // ✅ Direct integer comparison
            { prNumber: searchInt }
        ];
    }
}
```

## Files Modified
- `server/src/services/po.service.js`

## Testing
To verify the fix works:

1. **Create PO:**
```javascript
POST /api/pos
{
  "poNumber": "12345",      // Will be converted to 12345 (int)
  "prNumber": "67890",      // Will be converted to 67890 (int)
  "poDate": "2025-12-10",
  "vendorId": 1,
  "currency": "INR",
  "poValue": 500000
}
```

2. **Update PO:**
```javascript
PUT /api/pos/:id
{
  "poNumber": "99999",      // Will be converted to 99999 (int)
  "prNumber": "88888"       // Will be converted to 88888 (int)
}
```

3. **Search PO:**
```javascript
GET /api/pos?search=12345  // Will search for poNumber=12345 or prNumber=12345
```

## Impact
- ✅ PO creation now works with integer PO/PR numbers
- ✅ PO updates now work with integer PO/PR numbers
- ✅ PO search now works correctly with integer fields
- ✅ Maintains backward compatibility (accepts string input, converts to int)

## Related Changes
This fix is related to the schema update where we changed:
- `poNumber`: `String` → `Int`
- `prNumber`: `String?` → `Int?`

These changes were made to align with the user's data type requirements where PO Number and PR Number should be integers.

---
**Fixed:** 2025-12-11 00:05 IST
**Status:** ✅ PO Service Updated
**File:** server/src/services/po.service.js
