const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdminUser() {
    try {
        console.log('Resetting admin user...');

        // Hash the password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if admin role exists
        let adminRole = await prisma.role.findUnique({
            where: { name: 'Admin' }
        });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: { name: 'Admin' }
            });
            console.log('✓ Created Admin role');
        }

        // Upsert admin user
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                password_hash: hashedPassword,
                is_active: true
            },
            create: {
                name: 'Admin User',
                email: 'admin@example.com',
                password_hash: hashedPassword,
                is_active: true
            }
        });

        console.log('✓ Admin user created/updated');

        // Ensure admin has Admin role
        const existingRole = await prisma.userRole.findFirst({
            where: {
                user_id: adminUser.id,
                role_id: adminRole.id
            }
        });

        if (!existingRole) {
            await prisma.userRole.create({
                data: {
                    user_id: adminUser.id,
                    role_id: adminRole.id
                }
            });
            console.log('✓ Assigned Admin role to user');
        }

        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Email: admin@example.com');
        console.log('Password: password123');
        console.log('========================\n');

    } catch (error) {
        console.error('Error resetting admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminUser();
