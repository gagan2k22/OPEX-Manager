const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMasterData() {
    console.log('\n=== MASTER DATA VERIFICATION ===\n');

    try {
        // 1. Budget Heads
        const budgetHeads = await prisma.budgetHeadMaster.findMany({ orderBy: { head_name: 'asc' } });
        console.log(`✓ Budget Heads: ${budgetHeads.length} records`);
        budgetHeads.forEach((h, i) => console.log(`  ${i + 1}. ${h.head_name}`));

        // 2. Towers
        const towers = await prisma.towerMaster.findMany({ orderBy: { tower_name: 'asc' } });
        console.log(`\n✓ Towers: ${towers.length} records`);
        towers.forEach((t, i) => console.log(`  ${i + 1}. ${t.tower_name}`));

        // 3. PO Entities
        const poEntities = await prisma.pOEntityMaster.findMany({ orderBy: { entity_name: 'asc' } });
        console.log(`\n✓ PO Entities: ${poEntities.length} records`);
        poEntities.forEach((e, i) => console.log(`  ${i + 1}. ${e.entity_name}`));

        // 4. Allocation Types
        const allocTypes = await prisma.allocationTypeMaster.findMany({ orderBy: { type_name: 'asc' } });
        console.log(`\n✓ Allocation Types: ${allocTypes.length} records`);
        allocTypes.forEach((t, i) => console.log(`  ${i + 1}. ${t.type_name}`));

        // 5. Allocation Bases
        const allocBases = await prisma.allocationBasisMaster.findMany({ orderBy: { basis_name: 'asc' } });
        console.log(`\n✓ Allocation Bases: ${allocBases.length} records`);
        allocBases.forEach((b, i) => console.log(`  ${i + 1}. ${b.basis_name}`));

        console.log('\n=== SUMMARY ===');
        console.log(`Total Budget Heads: ${budgetHeads.length}`);
        console.log(`Total Towers: ${towers.length}`);
        console.log(`Total PO Entities: ${poEntities.length}`);
        console.log(`Total Allocation Types: ${allocTypes.length}`);
        console.log(`Total Allocation Bases: ${allocBases.length}`);
        console.log(`\nGrand Total: ${budgetHeads.length + towers.length + poEntities.length + allocTypes.length + allocBases.length} master data records`);

    } catch (error) {
        console.error('Error verifying master data:', error);
    }
}

verifyMasterData()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
