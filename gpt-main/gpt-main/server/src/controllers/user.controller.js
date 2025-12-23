const userService = require('../services/user.service');
const prisma = require('../prisma');
const logger = require('../utils/logger');
const { getPermissionsForRoles } = require('../middleware/permission.middleware');

/**
 * User Controller
 * Routes traffic to User Service with proper error handling and logging
 */

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.listUsers();

        // Add permissions to response
        const enhancedUsers = users.map(u => ({
            ...u,
            permissions: getPermissionsForRoles(u.roles)
        }));

        res.json(enhancedUsers);
    } catch (error) {
        logger.error('Get All Users Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        const roleNames = user.roles.map(ur => ur.role.name);

        logger.info('Admin created user: %s (By: %s)', user.email, req.user.email);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: roleNames,
                permissions: getPermissionsForRoles(roleNames)
            }
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }
        logger.error('Create User Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);
        const roleNames = user.roles.map(ur => ur.role.name);

        logger.info('User updated: %s (By: %s)', user.email, req.user.email);

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_active: user.is_active,
                roles: roleNames,
                permissions: getPermissionsForRoles(roleNames)
            }
        });
    } catch (error) {
        if (error.statusCode < 500) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        logger.error('Update User Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id, req.user.id);

        logger.warn('User deleted: ID %s (By: %s)', id, req.user.email);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        if (error.statusCode < 500) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        logger.error('Delete User Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { roles: { include: { role: true } } }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const roleNames = user.roles.map(ur => ur.role.name);
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            roles: roleNames,
            permissions: getPermissionsForRoles(roleNames)
        });
    } catch (error) {
        logger.error('Get User By ID Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
        res.json(roles);
    } catch (error) {
        logger.error('Get All Roles Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPermissionMatrix = async (req, res) => {
    try {
        const { PERMISSIONS } = require('../middleware/permission.middleware');
        const matrix = {};
        for (const [perm, roles] of Object.entries(PERMISSIONS)) {
            matrix[perm] = {
                Viewer: roles.includes('Viewer'),
                Editor: roles.includes('Editor'),
                Approver: roles.includes('Approver'),
                Admin: roles.includes('Admin')
            };
        }
        res.json({ permissions: PERMISSIONS, matrix });
    } catch (error) {
        logger.error('Get Permission Matrix Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
    getPermissionMatrix
};
