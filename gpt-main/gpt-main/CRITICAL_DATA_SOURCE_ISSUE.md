# 🔴 CRITICAL ISSUE FOUND - All Pages Using Same Data Source

**Date:** 2025-12-27 14:24:00  
**Issue:** Budget BOA Allocation data appearing on all pages  
**Root Cause:** All pages calling the same API endpoints

---

## 🔍 Problem Identified

### **Current API Endpoints Being Used:**

| Page | Current API Endpoint | Problem |
|------|---------------------|---------|
| **Budget Tracker** | `/budgets/tracker` | ✅ Correct endpoint |
| **Purchase Order Details (Variance)** | `/budgets/tracker` | ❌ SAME as Budget Tracker |
| **Net Budget** | `/budgets/net-tracker` | ❌ Returns BOA data |
| **Net Actual** | `/budgets/net-tracker` | ❌ SAME as Net Budget |
| **Allocation Base** | `/budgets/boa-allocation` | ✅ Correct - isolated |

---

## 📊 What's Happening

### **The Problem:**
All pages except Allocation Base are fetching data from the **SAME backend endpoints**, which is why they all show the same data (including BOA allocation data).

### **Evidence:**

**1. Budget Tracker (BudgetList.jsx) - Line 125:**
```javascript
const result = await api.get(`/budgets/tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${sortParam}${searchParam}`);
```

**2. Purchase Order Details (Variance.jsx) - Line 65:**
```javascript
const result = await api.get(`/budgets/tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${sortParam}${searchParam}`);
```
☝️ **SAME ENDPOINT as Budget Tracker!**

**3. Net Budget (NetBudget.jsx) - Line 60:**
```javascript
const response = await api.get(`/budgets/net-tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${sortParam}${searchParam}`);
```

**4. Net Actual (NetActual.jsx) - Line 56:**
```javascript
const response = await api.get(`/budgets/net-tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${sortParam}${searchParam}`);
```
☝️ **SAME ENDPOINT as Net Budget!**

---

## ✅ Solution Required

### **Each page needs its OWN data source:**

| Page | Should Use | Data Type | Status |
|------|-----------|-----------|--------|
| **Budget Tracker** | `/budgets/tracker` | Budget master data | ✅ Keep as is |
| **Purchase Order Details** | `/budgets/po-details` OR use tracker with PO fields | PO/PR information | 🔴 Needs separate endpoint OR filter |
| **Net Budget** | `/budgets/net-budget` | Entity-wise budget splits | 🔴 Needs NEW endpoint |
| **Net Actual** | `/budgets/net-actual` | Entity-wise actual splits | 🔴 Needs NEW endpoint |
| **Allocation Base** | `/budgets/boa-allocation` | BOA allocation data | ✅ Already isolated |

---

## 🎯 Awaiting Your Instructions

**Please tell me for each page:**

### **1. Budget Tracker Page**
- ✅ Keep as is? (uses `/budgets/tracker`)
- What data should it show?

### **2. Purchase Order Details (Variance) Page**
- Should it use the same data as Budget Tracker but show different columns?
- OR should it have a completely separate data source?
- What columns/data should it display?

### **3. Net Budget Page**
- What data source should it use?
- Is it calculated from Budget Tracker data?
- OR does it come from a separate Excel upload?
- What columns/data should it display?

### **4. Net Actual Page**
- What data source should it use?
- Is it calculated from Budget Tracker data?
- OR does it come from a separate Excel upload?
- What columns/data should it display?

---

## 📝 Implementation Options

### **Option A: Separate Excel Uploads**
Each page gets its own Excel upload and separate database tables:
- Budget Tracker Excel → Budget Tracker table
- PO Details Excel → PO Details table
- Net Budget Excel → Net Budget table
- Net Actual Excel → Net Actual table

### **Option B: Calculated/Derived Data**
Some pages calculate data from Budget Tracker:
- Budget Tracker = Source data (Excel upload)
- PO Details = Same data, different view (no new upload)
- Net Budget = Calculated from Budget Tracker
- Net Actual = Calculated from Budget Tracker

### **Option C: Hybrid Approach**
Mix of uploads and calculations:
- Budget Tracker = Excel upload
- PO Details = Same data as Budget Tracker (just different columns)
- Net Budget = Separate Excel upload
- Net Actual = Separate Excel upload

---

## 🔧 What I Need From You

**Please provide for EACH page:**

1. **Data Source:**
   - Separate Excel upload?
   - Calculated from another page?
   - Same data, different view?

2. **Table Structure:**
   - What columns should appear?
   - What data should each column contain?

3. **Relationships:**
   - How does this page connect to other pages?
   - Example: "Net Budget UID links to Budget Tracker UID"

4. **Excel Format (if separate upload):**
   - What columns in the Excel file?
   - Sample row of data?

---

## 📋 Current Page Details

### **Budget Tracker**
- **Columns:** UID, Parent UID, Vendor, Service Description, Dates, Budget Head, Tower, Contract, PO Entity, Allocation Basis, Initiative Type, Service Type, Budget, Actual, Remarks
- **Data:** Service master data with budget/actual information

### **Purchase Order Details (Variance)**
- **Columns:** UID, Service Description, Vendor, PO Entity, Service Dates, Budget Head, PR Number/Date/Amount, Currency, PO Number/Date/Value, PO Currency, Value in INR, Remarks, Value in Lac
- **Data:** Currently showing SAME as Budget Tracker

### **Net Budget**
- **Columns:** UID, Vendor, Service Description, Dates, Budget Head, Tower, PO Entity, Service Type, Initiative Type, Remarks, [Dynamic Entity Columns], Total Budget
- **Data:** Currently showing SAME as Net Actual (both use `/budgets/net-tracker`)

### **Net Actual**
- **Columns:** UID, Vendor, Service Description, Renewal Date, Budget Head, Tower, PO Entity, Service Type, [Dynamic Month-Entity Columns], [Month Split %], Total Spent
- **Data:** Currently showing SAME as Net Budget

---

## ⏳ Status

**Current:** All pages showing same/similar data due to shared endpoints  
**Required:** Your instructions on data source and structure for each page  
**Next Step:** Implement separate endpoints/data sources based on your requirements

---

## 💬 Questions for You

1. **Is Variance/PO Details the same data as Budget Tracker, just showing different columns?**
2. **Should Net Budget and Net Actual have separate Excel uploads?**
3. **Or should Net Budget/Actual be calculated from Budget Tracker data?**
4. **What is the relationship between these pages and Allocation Base?**
5. **Do you have sample Excel files for each page I can reference?**

---

**Waiting for your instructions to proceed with the fix!** 🚀
