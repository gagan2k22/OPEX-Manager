/*
  Warnings:

  - You are about to alter the column `poNumber` on the `PO` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `prNumber` on the `PO` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN "hasContract" BOOLEAN DEFAULT false;
ALTER TABLE "LineItem" ADD COLUMN "isSharedService" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "BudgetBOAData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_service" TEXT NOT NULL,
    "basis_of_allocation" TEXT,
    "total_count" INTEGER DEFAULT 0,
    "jpm_corporate" INTEGER DEFAULT 0,
    "jphi_corporate" INTEGER DEFAULT 0,
    "biosys_bengaluru" INTEGER DEFAULT 0,
    "biosys_noida" INTEGER DEFAULT 0,
    "biosys_greater_noida" INTEGER DEFAULT 0,
    "pharmova_api" INTEGER DEFAULT 0,
    "jgl_dosage" INTEGER DEFAULT 0,
    "jgl_ibp" INTEGER DEFAULT 0,
    "cadista_dosage" INTEGER DEFAULT 0,
    "jdi_radio_pharmaceuticals" INTEGER DEFAULT 0,
    "jdi_radiopharmacies" INTEGER DEFAULT 0,
    "jhs_gp_cmo" INTEGER DEFAULT 0,
    "jhs_llc_cmo" INTEGER DEFAULT 0,
    "jhs_llc_allergy" INTEGER DEFAULT 0,
    "ingrevia" INTEGER DEFAULT 0,
    "jil_jacpl" INTEGER DEFAULT 0,
    "jfl" INTEGER DEFAULT 0,
    "consumer" INTEGER DEFAULT 0,
    "jti" INTEGER DEFAULT 0,
    "jogpl" INTEGER DEFAULT 0,
    "enpro" INTEGER DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poNumber" INTEGER NOT NULL,
    "poDate" DATETIME NOT NULL,
    "prNumber" INTEGER,
    "prDate" DATETIME,
    "prAmount" REAL,
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
INSERT INTO "new_PO" ("budgetHeadId", "commonCurrencyValue", "createdAt", "currency", "exchangeRate", "id", "poDate", "poNumber", "poValue", "prAmount", "prDate", "prNumber", "status", "towerId", "valueInLac", "vendorId") SELECT "budgetHeadId", "commonCurrencyValue", "createdAt", "currency", "exchangeRate", "id", "poDate", "poNumber", "poValue", "prAmount", "prDate", "prNumber", "status", "towerId", "valueInLac", "vendorId" FROM "PO";
DROP TABLE "PO";
ALTER TABLE "new_PO" RENAME TO "PO";
CREATE UNIQUE INDEX "PO_poNumber_key" ON "PO"("poNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
