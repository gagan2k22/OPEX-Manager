const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

const commonSchemas = {
    id: Joi.number().integer().positive().required(),
    optionalId: Joi.number().integer().positive().optional(),
    amount: Joi.number().min(0).precision(2).required(),
    date: Joi.date().iso().required(),
    boolean: Joi.boolean().required(),
};

const schemas = {
    // Auth
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    register: Joi.object({
        name: Joi.string().max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        roles: Joi.array().items(Joi.string()).optional()
    }),

    // Master Data
    createEntity: Joi.object({
        name: Joi.string().max(255).required()
    }),

    createService: Joi.object({
        uid: Joi.string().required(),
        parent_uid: Joi.string().allow('', null),
        vendor: Joi.string().allow('', null),
        service: Joi.string().allow('', null),
        tower: Joi.string().allow('', null),
        budget_head: Joi.string().allow('', null),
    }),

    createCurrencyRate: Joi.object({
        from_currency: Joi.string().length(3).required(),
        to_currency: Joi.string().length(3).required(),
        rate: Joi.number().positive().required(),
        effective_date: Joi.date().optional()
    }),
};

function validate(schemaName, source = 'body') {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) return next(new Error(`Validation schema '${schemaName}' not found`));
        const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
        if (error) {
            const errors = error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message }));
            return next(new ValidationError('Validation failed', errors));
        }
        req[source] = value;
        next();
    };
}

function sanitizeInput(req, res, next) {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') obj[key] = obj[key].replace(/\0/g, '').trim();
            else if (typeof obj[key] === 'object') sanitize(obj[key]);
        });
        return obj;
    };
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
}

module.exports = { schemas, commonSchemas, validate, sanitizeInput };
