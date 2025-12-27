const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

/**
 * User Service
 * Handles business logic for specialized user management
 */

const BCRYPT_ROUNDS = 12;

const listUsers = async (includePermissions = false) => {
    const users = await prisma.user.findMany({
        include: {
            roles: { include: { role: true } }
        },
        orderBy: { created_at: 'desc' }
    });

    return users.map(user => {
        const roleNames = user.roles.map(ur => ur.role.name);
        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            roles: roleNames,
            created_at: user.created_at
        };
        return result;
    });
};

const createUser = async (userData) => {
    const { name, email, password, roles = ['Viewer'], is_active = true } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ValidationError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return await prisma.user.create({
        data: {
            name,
            email,
            password_hash: hashedPassword,
            is_active,
            roles: {
                create: roles.map(roleName => ({
                    role: {
                        connectOrCreate: {
                            where: { name: roleName },
                            create: { name: roleName }
                        }
                    }
                }))
            }
        },
        include: {
            roles: { include: { role: true } }
        }
    });
};

const updateUser = async (id, updateData) => {
    const { name, email, password, roles, is_active } = updateData;

    const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { roles: { include: { role: true } } }
    });

    if (!existingUser) throw new NotFoundError('User');

    // PROTECT ADMIN: Cannot remove Admin role
    const wasAdmin = existingUser.roles.some(r => r.role.name === 'Admin');
    if (wasAdmin && roles && !roles.includes('Admin')) {
        throw new ValidationError('Cannot remove Admin privileges from an Administrator.');
    }

    // PROTECT ADMIN: Cannot disable Admin account
    if (wasAdmin && is_active === false) {
        throw new ValidationError('Cannot disable an Administrator account.');
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (is_active !== undefined) data.is_active = is_active;

    if (password) {
        data.password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        data.passwordChangedAt = new Date();
    }

    return await prisma.$transaction(async (tx) => {
        // Update basic info
        const user = await tx.user.update({
            where: { id: parseInt(id) },
            data,
            include: { roles: true }
        });

        // Update roles if provided
        if (roles && Array.isArray(roles)) {
            // Remove old roles
            await tx.userRole.deleteMany({ where: { user_id: parseInt(id) } });

            // Add new roles
            for (const roleName of roles) {
                const role = await tx.role.upsert({
                    where: { name: roleName },
                    update: {},
                    create: { name: roleName }
                });

                await tx.userRole.create({
                    data: { user_id: user.id, role_id: role.id }
                });
            }
        }

        return await tx.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } }
        });
    });
};

const deleteUser = async (id, currentUserId) => {
    const targetId = parseInt(id);
    if (targetId === currentUserId) {
        throw new ValidationError('Cannot delete your own account');
    }

    const userToDelete = await prisma.user.findUnique({
        where: { id: targetId },
        include: { roles: { include: { role: true } } }
    });

    if (!userToDelete) throw new NotFoundError('User');

    // PROTECT ADMIN: Cannot delete Admin
    if (userToDelete.roles.some(r => r.role.name === 'Admin')) {
        throw new ValidationError('Cannot delete an Administrator account.');
    }

    return await prisma.$transaction(async (tx) => {
        await tx.userRole.deleteMany({ where: { user_id: targetId } });
        await tx.userActivityLog.deleteMany({ where: { user_id: targetId } });
        await tx.auditLog.deleteMany({ where: { user_id: targetId } });
        await tx.importHistory.deleteMany({ where: { userId: targetId } }); // Cascade delete
        return await tx.user.delete({ where: { id: targetId } });
    });
};

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser
};
