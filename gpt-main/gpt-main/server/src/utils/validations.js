const { z } = require('zod');

const trackerUpdateSchema = z.object({
    auditComment: z.string().min(3, "Comment must be at least 3 characters long"),
    uid: z.string().optional(),
    parent_uid: z.string().optional().nullable(),
    vendor: z.string().optional(),
    description: z.string().optional(),
    service_start_date: z.string().or(z.date()).optional().nullable(),
    service_end_date: z.string().or(z.date()).optional().nullable(),
    renewal_month: z.string().or(z.date()).optional().nullable(),
    budget_head: z.string().optional(),
    tower: z.string().optional(),
    contract: z.string().optional().nullable(),
    po_entity: z.string().optional().nullable(),
    allocation_basis: z.string().optional().nullable(),
    initiative_type: z.string().optional(),
    service_type: z.string().optional(),
    fy_budget: z.number().optional(),
    remarks: z.string().optional().nullable(),
    // New PR/PO fields
    pr_number: z.string().optional().nullable(),
    pr_date: z.string().or(z.date()).optional().nullable(),
    pr_amount: z.number().optional().nullable(),
    currency: z.string().optional().nullable(),
    po_number: z.string().optional().nullable(),
    po_date: z.string().or(z.date()).optional().nullable(),
    po_value: z.number().optional().nullable(),
    common_currency: z.string().optional().nullable(), 
    common_currency_value_inr: z.number().optional().nullable(),
});

const monthlyActualUpdateSchema = z.object({
    service_id: z.number().int().positive(),
    entity_id: z.number().int().positive(),
    month_no: z.number().int().min(1).max(12),
    amount: z.number().nonnegative(),
    auditComment: z.string().min(5, "Comment must be at least 5 characters long").optional(),
});

module.exports = {
    trackerUpdateSchema,
    monthlyActualUpdateSchema
};
