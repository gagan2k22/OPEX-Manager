# 📊 OPEX Manager - Page & Excel Upload Mapping

**Date:** 2025-12-27  
**Purpose:** Track which Excel file uploads to which page/table

---

## 🎯 Current Status

### ✅ **Allocation Base Page**
- **File:** `client/src/pages/AllocationBase.jsx`
- **Excel Upload:** Budget BOA Allocation (`.xlsx`, `.xls`)
- **API Endpoint:** `POST /api/budgets/import-boa`
- **Tables Displayed:**
  1. Budget BOA Allocation (absolute values)
  2. BOA Allocation Percentage (percentages)
- **Status:** ✅ CORRECTLY CONFIGURED
- **Upload Button:** Only visible to Admin users

---

## 📋 Pages Requiring Separate Excel Uploads

### **1. Budget List (Budget Tracker)**
- **File:** `client/src/pages/BudgetList.jsx`
- **Current Upload:** General budget import via `handleImport()`
- **API Endpoint:** `POST /api/budgets/import` (existing)
- **Excel Format:** Budget Tracker Excel
- **Tables/Data:**
  - Service Master data
  - Procurement details
  - FY Actuals
  - Budget information
- **Status:** ⚠️ NEEDS REVIEW - Has its own import functionality
- **Notes:** This page already has import functionality at line 64-83

---

### **2. Net Actual Page**
- **File:** `client/src/pages/NetActual.jsx`
- **Current Upload:** ❌ NONE
- **Required Upload:** Net Actual Excel
- **API Endpoint:** 🔴 TO BE CREATED - `POST /api/budgets/import-net-actual`
- **Tables/Data:**
  - Monthly entity actuals
  - Entity-wise breakdown
  - Month-wise data (02, 03, 05, etc.)
- **Status:** 🔴 NEEDS IMPLEMENTATION
- **Excel Columns Expected:**
  - UID
  - Vendor
  - Service Description
  - Renewal Date
  - Budget Head
  - Tower
  - PO Entity
  - Service Type
  - Entity columns (JPM Corporate, JPHI Corporate, etc.)
  - Month columns (02, 03, 05, etc.)

---

### **3. Net Budget Page**
- **File:** `client/src/pages/NetBudget.jsx`
- **Current Upload:** ❌ NONE
- **Required Upload:** Net Budget Excel
- **API Endpoint:** 🔴 TO BE CREATED - `POST /api/budgets/import-net-budget`
- **Tables/Data:**
  - Budget allocations
  - Entity-wise budget
  - Service-wise budget
- **Status:** 🔴 NEEDS IMPLEMENTATION
- **Excel Columns Expected:**
  - Similar to Net Actual but for budget data

---

### **4. Variance Page (Purchase Order Details)**
- **File:** `client/src/pages/Variance.jsx`
- **Current Upload:** ❌ NONE
- **Required Upload:** PO/PR Details Excel
- **API Endpoint:** 🔴 TO BE CREATED - `POST /api/budgets/import-po-details`
- **Tables/Data:**
  - PR Number, PR Date, PR Amount
  - PO Number, PO Date, PO Value
  - Currency conversion
  - Value in INR, Value in Lac
- **Status:** 🔴 NEEDS IMPLEMENTATION
- **Excel Columns Expected:**
  - UID
  - Service Description
  - Vendor
  - PO Entity
  - Service Start Date
  - Service End Date
  - Budget Head
  - PR Number, PR Date, PR Amount, Currency
  - PO Number, PO Date, PO Value, PO Currency
  - Value in INR
  - Remarks
  - Value in Lac

---

### **5. Actual BOA Page**
- **File:** `client/src/pages/ActualBOA.jsx`
- **Current Upload:** ❌ UNKNOWN (need to check)
- **Required Upload:** Actual BOA Excel (if different from Budget BOA)
- **API Endpoint:** 🔴 TO BE DETERMINED
- **Status:** ⚠️ NEEDS REVIEW

---

### **6. Budget BOA Page**
- **File:** `client/src/pages/BudgetBOA.jsx`
- **Current Upload:** ❌ UNKNOWN (need to check)
- **Required Upload:** Budget BOA Excel (if different from Allocation Base)
- **API Endpoint:** 🔴 TO BE DETERMINED
- **Status:** ⚠️ NEEDS REVIEW

---

## 🔗 Table Relationships & Data Flow

**AWAITING USER INPUT:**
- Which table data connects to which other table?
- What is the relationship between:
  - Budget List ↔ Allocation Base
  - Net Budget ↔ Net Actual
  - Variance ↔ Budget List
  - Budget BOA ↔ Allocation Base
  - Actual BOA ↔ Net Actual

---

## 📝 Excel Upload Implementation Checklist

For each page that needs Excel upload:

### **Frontend (React Component):**
- [ ] Add upload button (Admin only)
- [ ] Add file input handler
- [ ] Add FormData creation
- [ ] Add API call to backend
- [ ] Add success/error handling
- [ ] Add loading state
- [ ] Refresh data after upload

### **Backend (API Endpoint):**
- [ ] Create route in `server/src/routes/budget.routes.js`
- [ ] Create controller in `server/src/controllers/`
- [ ] Create service in `server/src/services/`
- [ ] Add Excel parsing logic (using ExcelJS)
- [ ] Add data validation
- [ ] Add database insertion/update
- [ ] Add error handling
- [ ] Add logging

---

## 🎯 Action Items

### **Immediate:**
1. ✅ **Allocation Base** - Already configured correctly
2. ⚠️ **Review BudgetList.jsx** - Check existing import functionality
3. ⚠️ **Review ActualBOA.jsx** - Determine if separate upload needed
4. ⚠️ **Review BudgetBOA.jsx** - Determine if separate upload needed

### **Pending User Input:**
- [ ] Confirm table relationships and data connections
- [ ] Confirm Excel format for each page
- [ ] Confirm which data should be shared vs. independent
- [ ] Confirm background logic for data synchronization

### **To Implement (After User Confirmation):**
- [ ] Net Actual Excel upload
- [ ] Net Budget Excel upload
- [ ] Variance/PO Details Excel upload
- [ ] Any other required uploads

---

## 📊 Current Excel Upload Summary

| Page | Has Upload? | Excel Type | API Endpoint | Status |
|------|-------------|------------|--------------|--------|
| **Allocation Base** | ✅ Yes | BOA Allocation | `/api/budgets/import-boa` | ✅ Working |
| **Budget List** | ✅ Yes | Budget Tracker | `/api/budgets/import` | ⚠️ Review |
| **Net Actual** | ❌ No | Net Actual | 🔴 Not Created | 🔴 Needs Implementation |
| **Net Budget** | ❌ No | Net Budget | 🔴 Not Created | 🔴 Needs Implementation |
| **Variance** | ❌ No | PO Details | 🔴 Not Created | 🔴 Needs Implementation |
| **Actual BOA** | ❓ Unknown | Actual BOA | 🔴 TBD | ⚠️ Needs Review |
| **Budget BOA** | ❓ Unknown | Budget BOA | 🔴 TBD | ⚠️ Needs Review |

---

## 🔍 Next Steps

**USER TO PROVIDE:**
1. **Table Relationships:** Which tables are connected and how?
2. **Data Flow:** What data flows from one page to another?
3. **Excel Formats:** Confirm the Excel structure for each upload
4. **Background Logic:** Explain the calculation/connection logic

**DEVELOPER TO DO:**
1. Review existing pages for upload functionality
2. Wait for user confirmation on relationships
3. Implement missing upload endpoints
4. Test data flow between pages

---

## 📌 Important Notes

- **Allocation Base is ISOLATED** - Only handles BOA allocation data
- **Each page should have its own Excel upload** - No mixing of data
- **Data relationships will be handled in backend logic** - Not in upload process
- **User will explain connections** - Before implementing cross-table logic

---

**Status:** 🟡 AWAITING USER INPUT  
**Last Updated:** 2025-12-27 12:52:00

---

## 💬 Questions for User

1. What is the relationship between Budget List and Allocation Base?
2. Does Net Actual data come from a separate Excel or is it calculated?
3. Does Net Budget data come from a separate Excel or is it calculated?
4. Is Variance data imported or calculated from Budget vs Actual?
5. What is the difference between Budget BOA and Allocation Base?
6. What is the difference between Actual BOA and Net Actual?
7. Which tables share data and which are independent?
