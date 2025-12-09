const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting full database seeding...');

    // 1. Seed Fiscal Years
    const fiscalYears = [
        { name: 'FY24', startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), isActive: false },
        { name: 'FY25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), isActive: true },
        { name: 'FY26', startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31'), isActive: false },
    ];

    for (const fy of fiscalYears) {
        await prisma.fiscalYear.upsert({
            where: { name: fy.name },
            update: {},
            create: fy,
        });
    }
    console.log('✓ Fiscal Years seeded');

    // 2. Seed Roles
    const roles = ['Admin', 'Editor', 'Viewer', 'Approver'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }
    console.log('✓ Roles seeded');

    // 3. Seed Admin User
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin123', 12);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password_hash: adminPassword }, // Update password to match known credential
        create: {
            name: 'Admin User',
            email: adminEmail,
            password_hash: adminPassword,
            is_active: true,
            roles: {
                create: {
                    role: {
                        connect: { name: 'Admin' }
                    }
                }
            }
        },
    });
    console.log('✓ Admin user seeded/updated');

    // 4. Seed Towers
    const towers = ['IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Legal'];
    for (const name of towers) {
        // Towers don't have unique constraint on name in schema, so manual check
        const exists = await prisma.tower.findFirst({ where: { name } });
        if (!exists) {
            await prisma.tower.create({ data: { name } });
        }
    }
    console.log('✓ Towers seeded');

    // 5. Seed Budget Heads
    // Helper to get tower ID
    const getTowerId = async (name) => {
        const t = await prisma.tower.findFirst({ where: { name } });
        return t ? t.id : null;
    };

    const budgetHeads = [
        { name: 'Software Licenses', tower: 'IT' },
        { name: 'Hardware Maintenance', tower: 'IT' },
        { name: 'Cloud Services', tower: 'IT' },
        { name: 'Professional Services', tower: 'IT' },
        { name: 'Employee Training', tower: 'HR' },
        { name: 'Recruitment', tower: 'HR' },
        { name: 'Office Supplies', tower: 'Operations' },
        { name: 'Audit Fees', tower: 'Finance' }
    ];

    for (const bh of budgetHeads) {
        const towerId = await getTowerId(bh.tower);
        if (towerId) {
            const exists = await prisma.budgetHead.findFirst({ where: { name: bh.name, tower_id: towerId } });
            if (!exists) {
                await prisma.budgetHead.create({
                    data: { name: bh.name, tower_id: towerId }
                });
            }
        }
    }
    console.log('✓ Budget Heads seeded');

    // 6. Seed Vendors
    const vendors = [
        { name: 'Microsoft', gst: '27AAAAA0000A1Z5' },
        { name: 'AWS', gst: '29BBBBB0000B1Z5' },
        { name: 'Google', gst: '07CCCCC0000C1Z5' },
        { name: 'Oracle', gst: '' },
        { name: 'Dell', gst: '' },
        { name: 'Zoom', gst: '' },
        { name: 'Salesforce', gst: '' }
    ];
    for (const v of vendors) {
        const exists = await prisma.vendor.findFirst({ where: { name: v.name } });
        if (!exists) {
            await prisma.vendor.create({
                data: { name: v.name, gst_number: v.gst }
            });
        }
    }
    console.log('✓ Vendors seeded');

    // 7. Seed Cost Centres
    const costCentres = [
        { code: 'CC001', description: 'Headquarters' },
        { code: 'CC002', description: 'R&D Bangalore' },
        { code: 'CC003', description: 'Sales Mumbai' },
        { code: 'CC004', description: 'Support Pune' }
    ];
    for (const cc of costCentres) {
        const exists = await prisma.costCentre.findUnique({ where: { code: cc.code } });
        if (!exists) {
            await prisma.costCentre.create({ data: cc });
        }
    }
    console.log('✓ Cost Centres seeded');

    // 8. Seed PO Entities
    const poEntities = ['JPMC India', 'JPMC US', 'JPMC UK', 'JPMC Singapore'];
    for (const name of poEntities) {
        await prisma.pOEntity.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }
    console.log('✓ PO Entities seeded');

    // 9. Seed Service Types
    const serviceTypes = ['Shared Service', 'Dedicated Service', 'Consulting', 'Managed Service'];
    for (const name of serviceTypes) {
        await prisma.serviceType.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }
    console.log('✓ Service Types seeded');

    // 10. Seed Allocation Bases
    const allocationBases = ['Headcount', 'Revenue', 'Usage', 'Fixed %', 'Square Footage'];
    for (const name of allocationBases) {
        await prisma.allocationBasis.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }
    console.log('✓ Allocation Bases seeded');

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
