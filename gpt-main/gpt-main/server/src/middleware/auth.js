/**
 * Authentication Middleware
 * Handles JWT verification and Role-Based Access Control (RBAC)
 */

const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const config = require('../config');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

/**
 * Verify JWT Token Middleware
 */
const authenticate = async (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            throw new AuthenticationError('Please log in to access this resource');
        }

        // 2. Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // 3. Check if user still exists
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                roles: {
                    include: {
                        role: true // Include nested Role model to get the name
                    }
                }
            },
        });

        if (!currentUser) {
            throw new AuthenticationError('The user belonging to this token no longer exists');
        }

        // 4. Single session enforcement
        // If the token has a sessionId, it must match the one stored in the DB
        if (decoded.sessionId && currentUser.currentSessionId !== decoded.sessionId) {
            throw new AuthenticationError('Your session has ended because you logged in from another device or browser.');
        }

        // 4. Check if user changed password after the token was issued
        // Note: Add passwordChangedAt field to User model if not present
        if (currentUser.passwordChangedAt) {
            const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
            if (changedTimestamp > decoded.iat) {
                throw new AuthenticationError('User recently changed password! Please log in again.');
            }
        }

        // Flatten roles for easier access: ['Admin', 'Viewer']
        const roleNames = currentUser.roles ? currentUser.roles.map(ur => ur.role.name) : [];

        // Store original object just in case under a different property
        currentUser._rolesRelationship = currentUser.roles;

        // Overwrite roles with the simple string array for compatibility with permission middleware
        currentUser.roles = roleNames;
        currentUser.roleNames = roleNames;

        // 5. Grant access to protected route
        req.user = currentUser;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            next(new AuthenticationError('Invalid token. Please log in again.'));
        } else if (err.name === 'TokenExpiredError') {
            next(new AuthenticationError('Your token has expired! Please log in again.'));
        } else {
            next(err);
        }
    }
};

/**
 * Restrict to specific roles
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'user')
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user has any of the required roles
        // user.roles is now an array of strings
        const userRoles = req.user.roles || [];

        // Check intersection
        const hasPermission = roles.some(role => userRoles.includes(role));

        if (!hasPermission) {
            return next(new AuthorizationError('You do not have permission to perform this action'));
        }

        next();
    };
};

module.exports = {
    authenticate,
    restrictTo,
};
