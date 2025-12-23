const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const crypto = require('crypto');

// Security: Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
}

const BCRYPT_ROUNDS = 12; // Increased from 10 for better security

const register = async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;

        // Input validation (additional to middleware)
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password with increased rounds
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create user with roles
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                roles: {
                    create: (roles || ['Viewer']).map(roleName => ({
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
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: user.id
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error('Registration error: %s', error.stack);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const logger = require('../utils/logger');

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        // Generic error message to prevent user enumeration
        if (!user) {
            logger.warn('Login failed: User not found (%s)', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.is_active) {
            logger.warn('Login failed: Account disabled (%s)', email);
            return res.status(401).json({ message: 'Account is disabled' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn('Login failed: Wrong password (%s)', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Extract role names
        const roleNames = user.roles.map(ur => ur.role.name);

        // Generate a new Session ID for single session enforcement
        const sessionId = crypto.randomUUID();

        // Update user with currentSessionId to invalidate other sessions
        await prisma.user.update({
            where: { id: user.id },
            data: { currentSessionId: sessionId }
        });

        // Generate JWT token including sessionId
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                roles: roleNames,
                sessionId: sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h',
                issuer: 'opex-system',
                audience: 'opex-client'
            }
        );

        logger.info('User logged in successfully (%s)', email);

        // Return token and safe user data
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: roleNames
            }
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error('Login error: %s', error.stack);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

module.exports = { register, login };
