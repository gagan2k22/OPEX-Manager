/**
 * Request Validation Middleware
 * Comprehensive input validation using Joi
 */

const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

/**
 * Common Validation Schemas
 */
const commonSchemas = {
    // ID validation
    id: Joi.number().integer().positive().required(),
    optionalId: Joi.number().integer().positive().optional(),

    // String validations
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),
    name: Joi.string().min(2).max(255).trim().required(),
    optionalName: Joi.string().min(2).max(255).trim().optional(),

    // Number validations
    amount: Joi.number().min(0).precision(2).required(),
    optionalAmount: Joi.number().min(0).precision(2).optional(),

    // Date validations
    date: Joi.date().iso().required(),
    optionalDate: Joi.date().iso().optional(),

    // Boolean validations
    boolean: Joi.boolean().required(),
    optionalBoolean: Joi.boolean().optional(),

    // Pagination
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),

    // Search
    search: Joi.string().max(255).trim().optional(),
    filter: Joi.object().optional(),
};

/**
 * Validation Schemas for Different Entities
 */
const schemas = {
    // Auth
    login: Joi.object({
        email: commonSchemas.email,
        password: Joi.string().required(), // Don't validate pattern on login
    }),

    register: Joi.object({
        name: commonSchemas.name,
        email: commonSchemas.email,
        password: commonSchemas.password,
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
            .messages({ 'any.only': 'Passwords must match' }),
    }),

    // Budget BOA (different from LineItem)
    createBudget: Joi.object({
        fiscal_year: Joi.number().integer().required(),
        tower_id: Joi.number().integer().required(),
        budget_head_id: Joi.number().integer().required(),
        cost_centre_id: Joi.number().integer().required(),
        allocation_basis_id: Joi.number().integer().optional().allow(null),
        annual_budget_amount: commonSchemas.amount,
        remarks: Joi.string().max(1000).optional().allow(''),
        monthly_breakdown: Joi.array().items(
            Joi.object({
                month: Joi.string().required(),
                budget_amount: commonSchemas.amount
            })
        ).required()
    }),

    updateBudget: Joi.object({
        annual_budget_amount: commonSchemas.amount,
        remarks: Joi.string().max(1000).optional().allow('')
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: commonSchemas.password,
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
            .messages({ 'any.only': 'Passwords must match' }),
    }),

    // User
    createUser: Joi.object({
        name: commonSchemas.name,
        email: commonSchemas.email,
        password: commonSchemas.password,
        roleIds: Joi.array().items(commonSchemas.id).min(1).required(),
        isActive: commonSchemas.optionalBoolean,
    }),

    updateUser: Joi.object({
        name: commonSchemas.optionalName,
        email: Joi.string().email().lowercase().trim().optional(),
        roleIds: Joi.array().items(commonSchemas.id).min(1).optional(),
        isActive: commonSchemas.optionalBoolean,
    }),

    // Budget/Line Item
    createLineItem: Joi.object({
        uid: Joi.string().max(100).trim().required(),
        description: Joi.string().max(1000).trim().required(),
        towerId: commonSchemas.optionalId,
        budgetHeadId: commonSchemas.optionalId,
        costCentreId: commonSchemas.optionalId,
        fiscalYearId: commonSchemas.optionalId,
        vendorId: commonSchemas.optionalId,
        serviceStartDate: commonSchemas.optionalDate,
        serviceEndDate: commonSchemas.optionalDate,
        contractId: Joi.string().max(100).trim().optional(),
        poEntityId: commonSchemas.optionalId,
        allocationBasisId: commonSchemas.optionalId,
        serviceTypeId: commonSchemas.optionalId,
        totalBudget: commonSchemas.amount,
        currency: Joi.string().length(3).uppercase().default('INR'),
        remarks: Joi.string().max(1000).trim().optional(),
        months: Joi.array().items(
            Joi.object({
                month: Joi.string().valid('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec').required(),
                amount: commonSchemas.amount,
            })
        ).optional(),
    }),

    updateLineItem: Joi.object({
        uid: Joi.string().max(100).trim().optional(),
        description: Joi.string().max(1000).trim().optional(),
        towerId: commonSchemas.optionalId,
        budgetHeadId: commonSchemas.optionalId,
        costCentreId: commonSchemas.optionalId,
        fiscalYearId: commonSchemas.optionalId,
        vendorId: commonSchemas.optionalId,
        serviceStartDate: commonSchemas.optionalDate,
        serviceEndDate: commonSchemas.optionalDate,
        contractId: Joi.string().max(100).trim().optional(),
        poEntityId: commonSchemas.optionalId,
        allocationBasisId: commonSchemas.optionalId,
        serviceTypeId: commonSchemas.optionalId,
        totalBudget: commonSchemas.optionalAmount,
        currency: Joi.string().length(3).uppercase().optional(),
        remarks: Joi.string().max(1000).trim().optional(),
    }),

    // PO
    // PO
    createPO: Joi.object({
        poNumber: Joi.number().integer().positive().required(),
        poDate: commonSchemas.date,
        prNumber: Joi.number().integer().positive().optional(),
        prDate: commonSchemas.optionalDate,
        prAmount: commonSchemas.optionalAmount,
        vendorId: commonSchemas.optionalId,
        towerId: commonSchemas.optionalId,
        budgetHeadId: commonSchemas.optionalId,
        currency: Joi.string().length(3).uppercase().default('INR'),
        poValue: commonSchemas.amount,
        exchangeRate: Joi.number().min(0).precision(4).optional(),
        commonCurrencyValue: commonSchemas.optionalAmount,
        valueInLac: commonSchemas.optionalAmount,
        status: Joi.string().max(50).optional(),
        linkedLineItems: Joi.array().items(
            Joi.object({
                id: commonSchemas.id,
                allocatedAmount: commonSchemas.amount
            })
        ).optional(),
        remarks: Joi.string().optional().allow('')
    }),

    updatePO: Joi.object({
        poNumber: Joi.number().integer().positive().optional(),
        poDate: commonSchemas.optionalDate,
        prNumber: Joi.number().integer().positive().optional(),
        prDate: commonSchemas.optionalDate,
        prAmount: commonSchemas.optionalAmount,
        vendorId: commonSchemas.optionalId,
        towerId: commonSchemas.optionalId,
        budgetHeadId: commonSchemas.optionalId,
        currency: Joi.string().length(3).uppercase().optional(),
        poValue: commonSchemas.optionalAmount,
        exchangeRate: Joi.number().min(0).precision(4).optional(),
        commonCurrencyValue: commonSchemas.optionalAmount,
        valueInLac: commonSchemas.optionalAmount,
        status: Joi.string().max(50).optional(),
        linkedLineItems: Joi.array().items(
            Joi.object({
                id: commonSchemas.id,
                allocatedAmount: commonSchemas.amount
            })
        ).optional(),
        remarks: Joi.string().optional().allow('')
    }),

    // Actual
    createActual: Joi.object({
        invoiceNo: Joi.string().max(100).trim().optional(),
        invoiceDate: commonSchemas.date,
        amount: commonSchemas.amount,
        currency: Joi.string().length(3).uppercase().default('INR'),
        convertedAmount: commonSchemas.optionalAmount,
        lineItemId: commonSchemas.optionalId,
        month: Joi.string().valid('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec').optional(),
        vendorId: commonSchemas.optionalId,
    }),

    // Master Data
    createMasterData: Joi.object({
        name: commonSchemas.name,
        code: Joi.string().max(50).trim().optional(),
        description: Joi.string().max(1000).trim().optional(),
        towerId: commonSchemas.optionalId,
        isActive: commonSchemas.optionalBoolean,
    }),

    updateMasterData: Joi.object({
        name: commonSchemas.optionalName,
        code: Joi.string().max(50).trim().optional(),
        description: Joi.string().max(1000).trim().optional(),
        towerId: commonSchemas.optionalId,
        isActive: commonSchemas.optionalBoolean,
    }),

    // Currency Rate
    createCurrencyRate: Joi.object({
        fromCurrency: Joi.string().length(3).uppercase().required(),
        toCurrency: Joi.string().length(3).uppercase().required(),
        rate: Joi.number().min(0).precision(4).required(),
        effectiveDate: commonSchemas.date,
    }),

    // Fiscal Year
    createFiscalYear: Joi.object({
        name: Joi.string().max(50).trim().required(),
        startDate: commonSchemas.date,
        endDate: commonSchemas.date,
        isActive: commonSchemas.optionalBoolean,
    }),

    // Pagination
    pagination: Joi.object({
        page: commonSchemas.page,
        limit: commonSchemas.limit,
        sortBy: commonSchemas.sortBy,
        sortOrder: commonSchemas.sortOrder,
        search: commonSchemas.search,
        filter: commonSchemas.filter,
    }),
};

/**
 * Validate Request Middleware Factory
 */
function validate(schemaName, source = 'body') {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return next(new Error(`Validation schema '${schemaName}' not found`));
        }

        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type,
            }));

            return next(new ValidationError('Validation failed', errors));
        }

        // Replace request data with validated and sanitized data
        req[source] = value;
        next();
    };
}

/**
 * Validate ID Parameter
 */
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const { error, value } = commonSchemas.id.validate(req.params[paramName]);

        if (error) {
            return next(new ValidationError(`Invalid ${paramName}`));
        }

        req.params[paramName] = value;
        next();
    };
}

/**
 * Sanitize Input
 * Remove potentially dangerous characters
 */
function sanitizeInput(req, res, next) {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                // Remove null bytes
                obj[key] = obj[key].replace(/\0/g, '');

                // Trim whitespace
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });

        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
}

module.exports = {
    schemas,
    commonSchemas,
    validate,
    validateId,
    sanitizeInput,
};
