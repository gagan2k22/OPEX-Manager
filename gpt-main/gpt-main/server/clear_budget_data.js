const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearBudgetData() {
    try {
        console.log('Starting to clear budget data...\n');

        // Delete in correct order to respect foreign key constraints

        // 1. Delete reconciliation notes
        const deletedNotes = await prisma.reconciliationNote.deleteMany({});
        console.log(`✓ Deleted ${deletedNotes.count} reconciliation notes`);

        // 2. Delete actuals
        const deletedActuals = await prisma.actual.deleteMany({});
        console.log(`✓ Deleted ${deletedActuals.count} actuals`);

        // 3. Delete PO line items
        const deletedPOLineItems = await prisma.pOLineItem.deleteMany({});
        console.log(`✓ Deleted ${deletedPOLineItems.count} PO line items`);

        // 4. Delete budget months
        const deletedMonths = await prisma.budgetMonth.deleteMany({});
        console.log(`✓ Deleted ${deletedMonths.count} budget months`);

        // 5. Delete audit logs related to line items
        const deletedAuditLogs = await prisma.auditLog.deleteMany({
            where: { entity: 'LineItem' }
        });
        console.log(`✓ Deleted ${deletedAuditLogs.count} audit logs`);

        // 6. Delete import jobs
        const deletedImportJobs = await prisma.importJob.deleteMany({
            where: { importType: 'budgets' }
        });
        console.log(`✓ Deleted ${deletedImportJobs.count} import jobs`);

        // 7. Finally, delete line items
        const deletedLineItems = await prisma.lineItem.deleteMany({});
        console.log(`✓ Deleted ${deletedLineItems.count} line items`);

        console.log('\n✅ All budget data cleared successfully!');
        console.log('\nYou can now re-upload your budget data.');

    } catch (error) {
        console.error('❌ Error clearing budget data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearBudgetData()
    .then(() => {
        console.log('\n🎉 Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
