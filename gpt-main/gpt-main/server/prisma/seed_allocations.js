const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const allocationTypes = [
    "Dedicated",
    "Shared"
];

const allocationBases = [
    "FY26-Employee-Global",
    "FY26-Global-Mailbox",
    "FY26-Trackwise Licenses-JPM",
    "FY26-Global-Mailbox-With-JFWL",
    "FY26-Master Control-All",
    "FY26-Master Control-MTL",
    "FY26-Master Control-Cadista",
    "FY26-SAP Licenses",
    "FY26-Concur Usage-SAP Entites",
    "FY26-Assets-Global",
    "FY26-India-Mailbox",
    "FY26-AWS-JVL",
    "FY26-LN Licenses",
    "FY26-Azure-JVL",
    "FY26-DR-JVL",
    "FY26-Revenue",
    "FY26-Global Employee-Exl. Consumer",
    "FY26-SDWAN-JVL",
    "FY26-Rfxcel",
    "FY26-Montreal-Revenue",
    "FY26-Adobe-NA",
    "FY26-Zoom-NA",
    "FY26-Revenue-NA",
    "FY26-Employee-NA",
    "FY26-Compliancewire",
    "FY26-Minitab-License",
    "FY26-Autocad",
    "FY26-DLP-NA",
    "FY26-NA-Mailbox",
    "FY26-Anaplan-JGL-API",
    "FY26-Corevist",
    "FY26-Tenable",
    "FY26-Anaplan-Reimplementation",
    "FY26-Assets-NA",
    "FY26-Assets-India",
    "FY26-Application User%",
    "FY26-Licenses-M365",
    "FY26-AWS-Biosys",
    "FY26-Salesforce-ABU",
    "FY26-Anaplan-JGL-FY'24-Only",
    "FY26-Druva-MTL",
    "FY26-Montreal-EMP Count",
    "FY26-Employee-Pharma India",
    "FY26-Employee-Pharma",
    "FY26-Employee-India",
    "FY26-SalesForce-JDI-ABU",
    "FY26-DC Infra",
    "FY26-Cadista-Aws",
    "FY26-DigiSign",
    "FY26-Application User%Excl Ingrevia",
    "FY26-Jira",
    "FY26-Summit JDR",
    "FY26-EY-Conformity",
    "FY26-EY-Conformity-NA",
    "FY26-JGL-IBP-Mailbox",
    "FY26-JGL-IBP-Asset",
    "FY26-JGL-IBP-Zoom",
    "FY26-JGL-IBP-Emp",
    "FY26-JGL-IBP-IT-Emp",
    "FY26-Revenue-Excl JVL",
    "FY26-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad",
    "FY26-Trackwise-MTL",
    "FY26-Trackwise-SPK",
    "FY26-GXP-OPS",
    "FY26-Cadista",
    "FY26-ISE-MTL",
    "FY26-SDWAN-HO",
    "FY26-SAP Licenses-JGL & API",
    "FY26-Spokane",
    "FY26-SAP Licenses-NA",
    "FY26-Montreal-JDI+JHSGP",
    "FY26-ChemAir",
    "FY26-Montreal-Minitab"
];

async function main() {
    console.log('Seeding Allocation Master Data...');

    // Seed Allocation Types
    for (const name of allocationTypes) {
        await prisma.allocationTypeMaster.upsert({
            where: { type_name: name },
            update: {},
            create: { type_name: name }
        });
    }
    console.log(`✓ Seeded ${allocationTypes.length} Allocation Types`);

    // Seed Allocation Bases
    for (const name of allocationBases) {
        await prisma.allocationBasisMaster.upsert({
            where: { basis_name: name },
            update: {},
            create: { basis_name: name }
        });
    }
    console.log(`✓ Seeded ${allocationBases.length} Allocation Bases`);

    console.log('Allocation seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding allocation data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
