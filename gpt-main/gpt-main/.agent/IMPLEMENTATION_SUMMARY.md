# Implementation Summary - Master Data & Auto-Calculations

## Latest Updates (Allocation Type & Basis)

### Changes Implemented

#### 1. Database Schema Updates (`server/prisma/schema.prisma`)
Added two new master data tables:
- **AllocationTypeMaster**: Stores allocation types (Dedicated, Shared)
- **AllocationBasisMaster**: Stores 75+ allocation basis options for FY26

#### 2. Backend Controller (`server/src/controllers/masterData.controller.js`)
Added CRUD operations for:
- `getAllocationTypes()` / `createAllocationType()`
- `getAllocationBases()` / `createAllocationBasis()`

All with caching support for performance.

#### 3. Backend Routes (`server/src/routes/masterData.routes.js`)
Added new endpoints:
- `GET/POST /master/allocation-types`
- `GET/POST /master/allocation-bases`

#### 4. Master Data Seeding (`server/prisma/seed_allocations.js`)
Created seed script with:

**Allocation Types:**
- Dedicated
- Shared

**Allocation Bases (75 items):**
- FY26-Employee-Global
- FY26-Global-Mailbox
- FY26-Trackwise Licenses-JPM
- FY26-Global-Mailbox-With-JFWL
- FY26-Master Control-All
- FY26-Master Control-MTL
- FY26-Master Control-Cadista
- FY26-SAP Licenses
- FY26-Concur Usage-SAP Entites
- FY26-Assets-Global
- FY26-India-Mailbox
- FY26-AWS-JVL
- FY26-LN Licenses
- FY26-Azure-JVL
- FY26-DR-JVL
- FY26-Revenue
- FY26-Global Employee-Exl. Consumer
- FY26-SDWAN-JVL
- FY26-Rfxcel
- FY26-Montreal-Revenue
- FY26-Adobe-NA
- FY26-Zoom-NA
- FY26-Revenue-NA
- FY26-Employee-NA
- FY26-Compliancewire
- FY26-Minitab-License
- FY26-Autocad
- FY26-DLP-NA
- FY26-NA-Mailbox
- FY26-Anaplan-JGL-API
- FY26-Corevist
- FY26-Tenable
- FY26-Anaplan-Reimplementation
- FY26-Assets-NA
- FY26-Assets-India
- FY26-Application User%
- FY26-Licenses-M365
- FY26-AWS-Biosys
- FY26-Salesforce-ABU
- FY26-Anaplan-JGL-FY'24-Only
- FY26-Druva-MTL
- FY26-Montreal-EMP Count
- FY26-Employee-Pharma India
- FY26-Employee-Pharma
- FY26-Employee-India
- FY26-SalesForce-JDI-ABU
- FY26-DC Infra
- FY26-Cadista-Aws
- FY26-DigiSign
- FY26-Application User%Excl Ingrevia
- FY26-Jira
- FY26-Summit JDR
- FY26-EY-Conformity
- FY26-EY-Conformity-NA
- FY26-JGL-IBP-Mailbox
- FY26-JGL-IBP-Asset
- FY26-JGL-IBP-Zoom
- FY26-JGL-IBP-Emp
- FY26-JGL-IBP-IT-Emp
- FY26-Revenue-Excl JVL
- FY26-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad
- FY26-Trackwise-MTL
- FY26-Trackwise-SPK
- FY26-GXP-OPS
- FY26-Cadista
- FY26-ISE-MTL
- FY26-SDWAN-HO
- FY26-SAP Licenses-JGL & API
- FY26-Spokane
- FY26-SAP Licenses-NA
- FY26-Montreal-JDI+JHSGP
- FY26-ChemAir
- FY26-Montreal-Minitab

#### 5. Frontend Master Data Page (`client/src/pages/MasterData.jsx`)
Expanded to include **7 tabs** (added 2 new):
1. Receiving Entities
2. Service & UID Master
3. Budget Heads
4. Towers
5. PO Entities
6. **Allocation Types** (NEW)
7. **Allocation Bases** (NEW)

#### 6. Frontend Budget Tracker (`client/src/pages/BudgetList.jsx`)
Enhanced with additional dropdowns:
- **Allocation Type**: Dropdown with "Dedicated" / "Shared"
- **Allocation Basis**: Dropdown with 75 FY26 allocation basis options

---

## Complete Feature List

### Auto-Calculation
- **Renewal Month** = Service Start Date + 364 days (auto-calculated, read-only)

### Dropdown Fields in Budget Tracker
All the following fields use dropdowns populated from master data:

1. **Budget Head** (8 options)
   - Software License AMC
   - IT Infra HW AMC & Consumables
   - Network Connectivity
   - IT Infrastructure Cloud Services
   - Other IT Expenses
   - Application development & support
   - Legal & Consulting Charges
   - IT Infrastructure Managed Services

2. **Tower** (7 options)
   - Infrastructure
   - Application
   - Cyber Security
   - General
   - ERP-LN
   - Digital
   - ERP-SAP

3. **PO Entity** (16 options)
   - Biosys - Bengaluru
   - Biosys - Greater Noida
   - Biosys - Noida
   - Cadista - Dosage
   - Ingrevia
   - JDI – Radio Pharmaceuticals
   - JDI - Radiopharmacies
   - JGL - Dosage
   - JHS GP CMO
   - JHS LLC - CMO
   - JIL - JACPL
   - JPHI Corporate
   - JPM Corporate
   - Pharmova - API
   - Enpro
   - Consumer

4. **Contract** (2 options)
   - Yes
   - No

5. **Allocation Type** (2 options)
   - Dedicated
   - Shared

6. **Allocation Basis** (75 options)
   - All FY26 allocation bases listed above

---

## How to Use

### Adding Master Data
1. Navigate to **Master Data** page
2. Select the appropriate tab (Budget Heads, Towers, PO Entities, Allocation Types, or Allocation Bases)
3. Click "Add" button
4. Enter the name and save

### Using Dropdowns in Budget Tracker
1. Navigate to **Budgets → Budget** page
2. Double-click any cell in the following columns to see dropdowns:
   - Budget Head
   - Tower
   - PO Entity
   - Contract
   - Allocation Type
   - Allocation Basis
3. Select from dropdown
4. Changes save automatically

### Renewal Month Auto-Calculation
- When you edit **Service Start Date**, the **Renewal Month** automatically updates to show the date 364 days later
- This field is read-only and cannot be manually edited

---

## Technical Notes
- All master data is cached for performance
- Dropdowns are populated on page load via parallel API calls
- Auto-calculation happens client-side for instant feedback
- Backend validates all updates before saving
- All master data tables support upsert operations for safe seeding
- Total of 7 master data categories now available for management

---

## Database Tables Created
1. `EntityMaster` - Receiving entities for allocation
2. `POEntityMaster` - Procurement entities
3. `BudgetHeadMaster` - Budget categories
4. `TowerMaster` - IT towers
5. `AllocationTypeMaster` - Allocation types (NEW)
6. `AllocationBasisMaster` - Allocation basis options (NEW)

---

## API Endpoints Available
- `GET/POST /master/entities`
- `GET/POST /master/services`
- `GET/POST /master/budget-heads`
- `GET/POST /master/towers`
- `GET/POST /master/po-entities`
- `GET/POST /master/allocation-types` (NEW)
- `GET/POST /master/allocation-bases` (NEW)
