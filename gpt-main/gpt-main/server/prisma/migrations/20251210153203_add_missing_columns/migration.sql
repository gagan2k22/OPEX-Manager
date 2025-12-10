-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN "allocationType" TEXT;
ALTER TABLE "LineItem" ADD COLUMN "costOptimizationLever" TEXT;
ALTER TABLE "LineItem" ADD COLUMN "initiativeType" TEXT;
ALTER TABLE "LineItem" ADD COLUMN "priority" TEXT;
ALTER TABLE "LineItem" ADD COLUMN "renewalDate" DATETIME;

-- AlterTable
ALTER TABLE "PO" ADD COLUMN "prAmount" REAL;
