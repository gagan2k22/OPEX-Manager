const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounts() {
    const counts = {
        budgetHeads: await prisma.budgetHeadMaster.count(),
        towers: await prisma.towerMaster.count(),
        poEntities: await prisma.pOEntityMaster.count(),
        allocationTypes: await prisma.allocationTypeMaster.count(),
        allocationBases: await prisma.allocationBasisMaster.count()
    };

    console.log('MASTER DATA COUNTS:');
    console.log('===================');
    console.log(`Budget Heads: ${counts.budgetHeads} (Expected: 8)`);
    console.log(`Towers: ${counts.towers} (Expected: 7)`);
    console.log(`PO Entities: ${counts.poEntities} (Expected: 16)`);
    console.log(`Allocation Types: ${counts.allocationTypes} (Expected: 2)`);
    console.log(`Allocation Bases: ${counts.allocationBases} (Expected: 75)`);
    console.log(`\nTOTAL: ${Object.values(counts).reduce((a, b) => a + b, 0)} records`);

    const allGood = counts.budgetHeads === 8 &&
        counts.towers === 7 &&
        counts.poEntities === 16 &&
        counts.allocationTypes === 2 &&
        counts.allocationBases === 75;

    console.log(`\nStatus: ${allGood ? '✓ ALL MASTER DATA LOADED SUCCESSFULLY!' : '✗ SOME DATA MISSING'}`);

    await prisma.$disconnect();
}

checkCounts().catch(console.error);
