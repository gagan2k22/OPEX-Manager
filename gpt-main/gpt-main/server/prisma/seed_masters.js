const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const budgetHeads = [
    "Software License AMC",
    "IT Infra HW AMC & Consumables",
    "Network Connectivity",
    "IT Infrastructure Cloud Services",
    "Other IT Expenses",
    "Application development & support",
    "Legal & Consulting Charges",
    "IT Infrastructure Managed Services"
];

const towers = [
    "Infrastructure",
    "Application",
    "Cyber Security",
    "General",
    "ERP-LN",
    "Digital",
    "ERP-SAP"
];

const poEntities = [
    "Biosys - Bengaluru",
    "Biosys - Greater Noida",
    "Biosys - Noida",
    "Cadista - Dosage",
    "Ingrevia",
    "JDI – Radio Pharmaceuticals",
    "JDI - Radiopharmacies",
    "JGL - Dosage",
    "JHS GP CMO",
    "JHS LLC - CMO",
    "JIL - JACPL",
    "JPHI Corporate",
    "JPM Corporate",
    "Pharmova - API",
    "Enpro",
    "Consumer"
];

async function main() {
    console.log('Seeding Master Data...');

    // Seed Budget Heads
    for (const name of budgetHeads) {
        await prisma.budgetHeadMaster.upsert({
            where: { head_name: name },
            update: {},
            create: { head_name: name }
        });
    }

    // Seed Towers
    for (const name of towers) {
        await prisma.towerMaster.upsert({
            where: { tower_name: name },
            update: {},
            create: { tower_name: name }
        });
    }

    // Seed PO Entities
    for (const name of poEntities) {
        await prisma.pOEntityMaster.upsert({
            where: { entity_name: name },
            update: {},
            create: { entity_name: name }
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
