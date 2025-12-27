const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const fyStart = now.getMonth() >= 3 ? year : year - 1;
    return `FY${String(fyStart).slice(-2)}`;
};

const currentFY = getCurrentFY();

async function main() {
    console.log('Starting Refactored XLS-to-DB Logic seeding...');

    // 1. Seed Roles
    const roles = ['Admin', 'Editor', 'Viewer', 'Approver'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
    }
    console.log('✓ Roles seeded');

    // 2. Seed Admin User
    const adminPassword = await bcrypt.hash('password123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { password_hash: adminPassword },
        create: {
            name: 'Jubilant Admin',
            email: 'admin@example.com',
            password_hash: adminPassword,
            is_active: true,
            roles: {
                create: {
                    role: { connect: { name: 'Admin' } }
                }
            }
        },
    });
    console.log('✓ Admin user seeded');

    // 3. Seed EntityMaster (4️⃣)
    const entities = [
        'JPM Corporate', 'JPHI Corporate', 'Biosys - Bengaluru', 'Biosys - Noida', 'Enpro'
    ];
    for (const name of entities) {
        await prisma.entityMaster.upsert({
            where: { entity_name: name },
            update: {},
            create: { entity_name: name }
        });
    }
    console.log('✓ Entity Master seeded');

    // 4. Seed ServiceMaster (1️⃣)
    const s1 = await prisma.serviceMaster.create({
        data: {
            uid: 'UID-2025-EL-001',
            parent_uid: null,
            vendor: 'Tata Power',
            vendor_service: 'Tata Power / Electricity',
            service: 'Electricity',
            service_description: 'Utility Electricity for COE-A',
            contract: 'CONT-2025-01',
            service_start_date: new Date('2025-04-01'),
            service_end_date: new Date('2026-03-31'),
            budget_head: 'Electricity',
            tower: 'Shared Utilities',
            priority: 'High',
            initiative_type: 'Existing',
            service_type: 'Dedicated',
            allocation_type: 'Dedicated',
            cost_optimization_lever: 'Energy Efficiency',
            remarks: 'Priority utility contract'
        }
    });

    const s2 = await prisma.serviceMaster.create({
        data: {
            uid: 'UID-2025-SW-002',
            parent_uid: null,
            vendor: 'Microsoft',
            vendor_service: 'Microsoft / Licenses',
            service: 'Software Subscription',
            service_description: 'Office 365 Licenses',
            contract: 'CONT-2025-02',
            service_start_date: new Date('2025-04-01'),
            service_end_date: new Date('2026-03-31'),
            budget_head: 'Software',
            tower: 'IT shared services',
            priority: 'Medium',
            initiative_type: 'Existing',
            service_type: 'Shared',
            allocation_type: 'Shared',
            cost_optimization_lever: 'Seat Management',
            remarks: 'Global IT contract'
        }
    });
    console.log('✓ Service Master seeded');

    // 5. Seed ProcurementDetails (2️⃣)
    await prisma.procurementDetail.create({
        data: {
            service_id: s1.id,
            entity: 'JPM Corporate',
            pr_number: 'PR-1001',
            pr_date: new Date('2025-03-15'),
            pr_amount: 1000000,
            currency: 'INR',
            po_number: 'PO-5001',
            po_date: new Date('2025-03-20'),
            po_value: 950000,
            common_currency_value_inr: 950000,
            value_in_lac: 9.5
        }
    });
    console.log('✓ Procurement Details seeded');

    // 6. Seed AllocationBasis (3️⃣)
    await prisma.allocationBasis.create({
        data: {
            service_id: s2.id,
            basis_of_allocation: 'Headcount',
            allocation_basis: 'Employee Count per unit',
            total_count: 500
        }
    });
    console.log('✓ Allocation Basis seeded');

    // 7. Seed FYActuals (5️⃣)
    await prisma.fYActual.create({
        data: {
            service_id: s1.id,
            financial_year: currentFY,
            fy_budget: 1200000,
            fy_actuals: 0
        }
    });
    await prisma.fYActual.create({
        data: {
            service_id: s2.id,
            financial_year: currentFY,
            fy_budget: 600000,
            fy_actuals: 0
        }
    });
    console.log('✓ FY Actuals (Control Numbers) seeded');

    // 8. Seed MonthlyEntityActuals (6️⃣)
    const jpm = await prisma.entityMaster.findUnique({ where: { entity_name: 'JPM Corporate' } });
    const jphi = await prisma.entityMaster.findUnique({ where: { entity_name: 'JPHI Corporate' } });

    await prisma.monthlyEntityActual.create({
        data: {
            service_id: s1.id,
            entity_id: jpm.id,
            month_no: 4, // April
            amount: 85000
        }
    });

    await prisma.monthlyEntityActual.create({
        data: {
            service_id: s1.id,
            entity_id: jphi.id,
            month_no: 4, // April
            amount: 15000
        }
    });
    console.log('✓ Monthly Entity Actuals seeded');

    console.log('Database seeded successfully with the EXACT EXCEL -> DB LOGIC FLOW.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
