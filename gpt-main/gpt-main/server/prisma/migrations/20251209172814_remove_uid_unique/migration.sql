/*
  Warnings:

  - You are about to drop the `ActualsBasis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetBOAData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetCalculation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetMonthly` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `biosys_bengaluru` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `biosys_greater_noida` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `biosys_noida` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `cadista_dosage` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `consumer` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `enpro` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `ingrevia` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jdi_radio_pharmaceuticals` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jdi_radiopharmacies` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jfl` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jgl_dosage` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jgl_ibp` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jhs_gp_cmo` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jhs_llc_allergy` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jhs_llc_cmo` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jil_jacpl` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jogpl` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jphi_corporate` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jpm_corporate` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `jti` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to drop the column `pharmova_api` on the `ActualBOAData` table. All the data in the column will be lost.
  - You are about to alter the column `total_count` on the `ActualBOAData` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `allocation_basis_id` on the `ActualsBOA` table. All the data in the column will be lost.
  - You are about to drop the column `run_date` on the `ActualsCalculation` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entity_type` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `new_value` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `old_value` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `allocation_basis_id` on the `BudgetBOA` table. All the data in the column will be lost.
  - You are about to drop the column `annual_budget_amount` on the `BudgetBOA` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `BudgetBOA` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `FiscalYear` table. All the data in the column will be lost.
  - You are about to drop the column `allocation_basis_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `budget_head_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `fiscal_year` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `fy25_allocation_amount` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `fy26_allocation_amount` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `fy27_allocation_amount` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `is_renewal` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `parent_uid` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `po_entity_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `po_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `service_description` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `service_end_date` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `service_start_date` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `service_type_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `tower_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit_cost` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `vendor_id` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `approval_date` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by_id` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `budget_head_id` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `common_currency` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `common_currency_value` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `po_date` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `po_end_date` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `po_entity_id` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `po_number` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `po_start_date` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `pr_amount` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `pr_date` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `pr_number` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `total_po_value` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `tower_id` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `value_in_lac` on the `PO` table. All the data in the column will be lost.
  - You are about to drop the column `vendor_id` on the `PO` table. All the data in the column will be lost.
  - Added the required column `entity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `FiscalYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FiscalYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `FiscalYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poDate` to the `PO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poNumber` to the `PO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poValue` to the `PO` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BudgetCalculation_budget_boa_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActualsBasis";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BudgetBOAData";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BudgetCalculation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BudgetMonthly";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BudgetMonth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineItemId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetMonth_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Actual" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNo" TEXT,
    "invoiceDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "convertedAmount" REAL,
    "lineItemId" INTEGER,
    "month" TEXT,
    "vendorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Actual_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Actual_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "POLineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_id" INTEGER NOT NULL,
    "line_item_id" INTEGER NOT NULL,
    "allocated_amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "POLineItem_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PO" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "POLineItem_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "LineItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "rowsTotal" INTEGER NOT NULL,
    "rowsAccepted" INTEGER NOT NULL,
    "rowsRejected" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "importType" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReconciliationNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineItemId" INTEGER NOT NULL,
    "actualId" INTEGER,
    "note" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReconciliationNote_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReconciliationNote_actualId_fkey" FOREIGN KEY ("actualId") REFERENCES "Actual" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReconciliationNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetBOAMonth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_boa_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "budget_amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetBOAMonth_budget_boa_id_fkey" FOREIGN KEY ("budget_boa_id") REFERENCES "BudgetBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PO_LineItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PO_LineItems_A_fkey" FOREIGN KEY ("A") REFERENCES "LineItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PO_LineItems_B_fkey" FOREIGN KEY ("B") REFERENCES "PO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActualBOAData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_service" TEXT NOT NULL,
    "fiscal_year" TEXT NOT NULL,
    "basis_of_allocation" TEXT,
    "total_count" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ActualBOAData" ("basis_of_allocation", "created_at", "fiscal_year", "id", "total_count", "updated_at", "vendor_service") SELECT "basis_of_allocation", "created_at", "fiscal_year", "id", "total_count", "updated_at", "vendor_service" FROM "ActualBOAData";
DROP TABLE "ActualBOAData";
ALTER TABLE "new_ActualBOAData" RENAME TO "ActualBOAData";
CREATE TABLE "new_ActualsBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "actual_amount" REAL NOT NULL,
    "remarks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "basis_id" INTEGER,
    CONSTRAINT "ActualsBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_basis_id_fkey" FOREIGN KEY ("basis_id") REFERENCES "AllocationBasis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ActualsBOA" ("actual_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "month", "remarks", "tower_id") SELECT "actual_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "month", "remarks", "tower_id" FROM "ActualsBOA";
DROP TABLE "ActualsBOA";
ALTER TABLE "new_ActualsBOA" RENAME TO "ActualsBOA";
CREATE TABLE "new_ActualsCalculation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_boa_id" INTEGER NOT NULL,
    "actuals_boa_id" INTEGER NOT NULL,
    "variance_amount" REAL NOT NULL,
    "variance_percentage" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActualsCalculation_budget_boa_id_fkey" FOREIGN KEY ("budget_boa_id") REFERENCES "BudgetBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsCalculation_actuals_boa_id_fkey" FOREIGN KEY ("actuals_boa_id") REFERENCES "ActualsBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActualsCalculation" ("actuals_boa_id", "budget_boa_id", "id", "variance_amount", "variance_percentage") SELECT "actuals_boa_id", "budget_boa_id", "id", "variance_amount", "variance_percentage" FROM "ActualsCalculation";
DROP TABLE "ActualsCalculation";
ALTER TABLE "new_ActualsCalculation" RENAME TO "ActualsCalculation";
CREATE TABLE "new_AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "diff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "id") SELECT "action", "id" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE TABLE "new_BudgetBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BudgetBOA" ("budget_head_id", "cost_centre_id", "fiscal_year", "id", "tower_id") SELECT "budget_head_id", "cost_centre_id", "fiscal_year", "id", "tower_id" FROM "BudgetBOA";
DROP TABLE "BudgetBOA";
ALTER TABLE "new_BudgetBOA" RENAME TO "BudgetBOA";
CREATE UNIQUE INDEX "BudgetBOA_fiscal_year_tower_id_budget_head_id_cost_centre_id_key" ON "BudgetBOA"("fiscal_year", "tower_id", "budget_head_id", "cost_centre_id");
CREATE TABLE "new_FiscalYear" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_FiscalYear" ("id") SELECT "id" FROM "FiscalYear";
DROP TABLE "FiscalYear";
ALTER TABLE "new_FiscalYear" RENAME TO "FiscalYear";
CREATE UNIQUE INDEX "FiscalYear_name_key" ON "FiscalYear"("name");
CREATE TABLE "new_LineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uid" TEXT NOT NULL,
    "parentUid" TEXT,
    "description" TEXT NOT NULL,
    "towerId" INTEGER,
    "budgetHeadId" INTEGER,
    "costCentreId" INTEGER,
    "fiscalYearId" INTEGER,
    "vendorId" INTEGER,
    "serviceStartDate" DATETIME,
    "serviceEndDate" DATETIME,
    "contractId" TEXT,
    "poEntityId" INTEGER,
    "allocationBasisId" INTEGER,
    "serviceTypeId" INTEGER,
    "totalBudget" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "remarks" TEXT,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LineItem_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_budgetHeadId_fkey" FOREIGN KEY ("budgetHeadId") REFERENCES "BudgetHead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_costCentreId_fkey" FOREIGN KEY ("costCentreId") REFERENCES "CostCentre" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FiscalYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_poEntityId_fkey" FOREIGN KEY ("poEntityId") REFERENCES "POEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_allocationBasisId_fkey" FOREIGN KEY ("allocationBasisId") REFERENCES "AllocationBasis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LineItem" ("id", "remarks", "uid") SELECT "id", "remarks", "uid" FROM "LineItem";
DROP TABLE "LineItem";
ALTER TABLE "new_LineItem" RENAME TO "LineItem";
CREATE TABLE "new_PO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poNumber" TEXT NOT NULL,
    "poDate" DATETIME NOT NULL,
    "prNumber" TEXT,
    "prDate" DATETIME,
    "vendorId" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "poValue" REAL NOT NULL,
    "exchangeRate" REAL,
    "commonCurrencyValue" REAL,
    "valueInLac" REAL,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "towerId" INTEGER,
    "budgetHeadId" INTEGER,
    CONSTRAINT "PO_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PO_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PO_budgetHeadId_fkey" FOREIGN KEY ("budgetHeadId") REFERENCES "BudgetHead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PO" ("currency", "id", "status") SELECT "currency", "id", "status" FROM "PO";
DROP TABLE "PO";
ALTER TABLE "new_PO" RENAME TO "PO";
CREATE UNIQUE INDEX "PO_poNumber_key" ON "PO"("poNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BudgetMonth_lineItemId_idx" ON "BudgetMonth"("lineItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetMonth_lineItemId_month_key" ON "BudgetMonth"("lineItemId", "month");

-- CreateIndex
CREATE INDEX "Actual_lineItemId_idx" ON "Actual"("lineItemId");

-- CreateIndex
CREATE INDEX "POLineItem_po_id_idx" ON "POLineItem"("po_id");

-- CreateIndex
CREATE INDEX "POLineItem_line_item_id_idx" ON "POLineItem"("line_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "POLineItem_po_id_line_item_id_key" ON "POLineItem"("po_id", "line_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedView_userId_name_page_key" ON "SavedView"("userId", "name", "page");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetBOAMonth_budget_boa_id_month_key" ON "BudgetBOAMonth"("budget_boa_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "_PO_LineItems_AB_unique" ON "_PO_LineItems"("A", "B");

-- CreateIndex
CREATE INDEX "_PO_LineItems_B_index" ON "_PO_LineItems"("B");
