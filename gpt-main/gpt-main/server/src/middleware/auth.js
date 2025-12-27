/**
 * Authentication Middleware
 * Handles JWT verification and Role-Based Access Control (RBAC)
 */

const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const config = require('../config');
const cache = require('../utils/cache');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

/**
 * Verify JWT Token Middleware (Optimized with Caching)
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
            console.log('[AUTH DEBUG] No token found in request');
            console.log('[AUTH DEBUG] Headers:', req.headers.authorization);
            console.log('[AUTH DEBUG] Cookies:', req.cookies);
            throw new AuthenticationError('Please log in to access this resource');
        }

        console.log('[AUTH DEBUG] Token found:', token.substring(0, 20) + '...');

        // 2. Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // 3. Check cache first to avoid DB query
        const cacheKey = `user:${decoded.id}:${decoded.sessionId || 'default'}`;
        let currentUser = await cache.get(cacheKey);

        if (!currentUser) {
            // Cache miss - fetch from database
            currentUser = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    is_active: true,
                    currentSessionId: true,
                    passwordChangedAt: true,
                    roles: {
                        select: {
                            role: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
            });

            if (currentUser) {
                // Cache user data for 5 minutes (300 seconds)
                await cache.set(cacheKey, currentUser, 300);
            }
        }

        if (!currentUser) {
            throw new AuthenticationError('The user belonging to this token no longer exists');
        }

        // 4. Check if user is active
        if (!currentUser.is_active) {
            throw new AuthenticationError('Account is disabled');
        }

        // 5. Single session enforcement
        if (decoded.sessionId && currentUser.currentSessionId !== decoded.sessionId) {
            // Invalidate cache on session mismatch
            await cache.del(cacheKey);
            throw new AuthenticationError('Your session has ended because you logged in from another device or browser.');
        }

        // 6. Check if user changed password after the token was issued
        if (currentUser.passwordChangedAt) {
            const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
            if (changedTimestamp > decoded.iat) {
                // Invalidate cache on password change
                await cache.del(cacheKey);
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

        // 7. Grant access to protected route
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
