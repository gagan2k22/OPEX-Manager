-- CreateIndex
CREATE INDEX "LineItem_uid_idx" ON "LineItem"("uid");

-- CreateIndex
CREATE INDEX "LineItem_vendorId_idx" ON "LineItem"("vendorId");

-- CreateIndex
CREATE INDEX "LineItem_fiscalYearId_idx" ON "LineItem"("fiscalYearId");

-- CreateIndex
CREATE INDEX "LineItem_budgetHeadId_idx" ON "LineItem"("budgetHeadId");

-- CreateIndex
CREATE INDEX "LineItem_towerId_idx" ON "LineItem"("towerId");
