const prisma = require('../prisma');

// Get all line items with pagination and optimized queries
const getLineItems = async (req, res) => {
    try {
        const { page = 1, limit = 100, uid, include_months } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = uid ? { uid: { contains: uid } } : {};

        // Build include object based on query params
        const include = {
            tower: { select: { id: true, name: true } },
            budgetHead: { select: { id: true, name: true } },
            vendor: { select: { id: true, name: true } },
            poEntity: { select: { id: true, name: true } },
            serviceType: { select: { id: true, name: true } },
            allocationBasis: { select: { id: true, name: true } },
            // po: { select: { id: true, po_number: true } } // Removed direct PO relation? Check schema
        };

        // Include monthly budgets if requested
        if (include_months === 'true') {
            include.months = {
                select: {
                    id: true,
                    month: true,
                    amount: true
                },
                orderBy: {
                    month: 'asc'
                }
            };
        }

        // Fetch line items
        const lineItems = await prisma.lineItem.findMany({
            where,
            include,
            orderBy: { uid: 'asc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        // Get total count for pagination
        const total = await prisma.lineItem.count({ where });

        res.json({
            data: lineItems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching line items:', error);
        res.status(500).json({ message: 'Error fetching line items' });
    }
};

// Create a new line item
const createLineItem = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['uid', 'vendor_id', 'service_description', 'tower_id', 'budget_head_id', 'unit_cost', 'quantity', 'total_cost'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        const {
            uid,
            parent_uid,
            po_id,
            vendor_id,
            service_description,
            service_start_date,
            service_end_date,
            tower_id,
            budget_head_id,
            po_entity_id,
            service_type_id,
            allocation_basis_id,
            is_renewal,
            unit_cost,
            quantity,
            total_cost,
            fiscal_year,
            remarks
        } = req.body;

        // Validate numeric values
        const numericFields = {
            vendor_id: parseInt(vendor_id),
            tower_id: parseInt(tower_id),
            budget_head_id: parseInt(budget_head_id),
            unit_cost: parseFloat(unit_cost),
            quantity: parseInt(quantity),
            total_cost: parseFloat(total_cost)
        };

        // Check for NaN values
        for (const [field, value] of Object.entries(numericFields)) {
            if (isNaN(value)) {
                return res.status(400).json({
                    message: 'Invalid numeric value',
                    field,
                    value: req.body[field]
                });
            }
        }

        // Validate positive values
        if (numericFields.unit_cost < 0 || numericFields.quantity < 0 || numericFields.total_cost < 0) {
            return res.status(400).json({
                message: 'Unit cost, quantity, and total cost must be non-negative'
            });
        }

        // UID uniqueness check removed to allow multiple PO entities to share the same UID

        // Verify foreign key references exist (parallel queries for better performance)
        const [vendor, tower, budgetHead] = await Promise.all([
            prisma.vendor.findUnique({ where: { id: numericFields.vendor_id }, select: { id: true } }),
            prisma.tower.findUnique({ where: { id: numericFields.tower_id }, select: { id: true } }),
            prisma.budgetHead.findUnique({ where: { id: numericFields.budget_head_id }, select: { id: true } })
        ]);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found', vendor_id: numericFields.vendor_id });
        }
        if (!tower) {
            return res.status(404).json({ message: 'Tower not found', tower_id: numericFields.tower_id });
        }
        if (!budgetHead) {
            return res.status(404).json({ message: 'Budget Head not found', budget_head_id: numericFields.budget_head_id });
        }

        // Helper to get Fiscal Year ID
        const getFiscalYearId = async (yearInput) => {
            if (!yearInput) return null;
            const yearNum = parseInt(yearInput);
            const shortYear = yearNum > 2000 ? yearNum - 2000 : yearNum; // Handle 2025 -> 25
            const name = `FY${shortYear}`;
            const fy = await prisma.fiscalYear.findUnique({ where: { name } });
            return fy ? fy.id : null;
        };

        const fiscalYearId = await getFiscalYearId(fiscal_year);

        // Map total_cost to the appropriate fiscal year allocation field
        const fyYear = fiscal_year ? parseInt(fiscal_year) : null;
        const allocationData = {
            fy25_allocation_amount: fyYear === 2025 ? numericFields.total_cost : null,
            fy26_allocation_amount: fyYear === 2026 ? numericFields.total_cost : null,
            fy27_allocation_amount: fyYear === 2027 ? numericFields.total_cost : null
        };

        const lineItem = await prisma.lineItem.create({
            data: {
                uid,
                parentUid: parent_uid || null,
                contractId: req.body.contract_id || null,
                vendorId: numericFields.vendor_id,
                description: service_description,
                serviceStartDate: service_start_date ? new Date(service_start_date) : null,
                serviceEndDate: service_end_date ? new Date(service_end_date) : null,
                towerId: numericFields.tower_id,
                budgetHeadId: numericFields.budget_head_id,
                poEntityId: po_entity_id ? parseInt(po_entity_id) : null,
                serviceTypeId: service_type_id ? parseInt(service_type_id) : null,
                allocationBasisId: allocation_basis_id ? parseInt(allocation_basis_id) : null,
                totalBudget: numericFields.total_cost,
                fiscalYearId: fiscalYearId,
                remarks: remarks || null
            },
            include: {
                tower: true,
                budgetHead: true,
                poEntity: true,
                serviceType: true,
                allocationBasis: true,
                vendor: true
            }
        });

        res.status(201).json(lineItem);
    } catch (error) {
        console.error('Error creating line item:', error);
        res.status(500).json({
            message: 'Error creating line item',
            error: error.message
        });
    }
};

// Update a line item
const updateLineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            parent_uid, contract_id, vendor_id, service_description,
            service_start_date, service_end_date, tower_id, budget_head_id,
            po_entity_id, service_type_id, allocation_basis_id,
            total_cost, fiscal_year, remarks
        } = req.body;

        const updateData = {};
        if (parent_uid !== undefined) updateData.parentUid = parent_uid;
        if (contract_id !== undefined) updateData.contractId = contract_id;
        if (vendor_id) updateData.vendorId = parseInt(vendor_id);
        if (service_description) updateData.description = service_description;
        if (service_start_date) updateData.serviceStartDate = new Date(service_start_date);
        if (service_end_date) updateData.serviceEndDate = new Date(service_end_date);
        if (tower_id) updateData.towerId = parseInt(tower_id);
        if (budget_head_id) updateData.budgetHeadId = parseInt(budget_head_id);
        if (po_entity_id) updateData.poEntityId = parseInt(po_entity_id);
        if (service_type_id) updateData.serviceTypeId = parseInt(service_type_id);
        if (allocation_basis_id) updateData.allocationBasisId = parseInt(allocation_basis_id);
        if (total_cost) updateData.totalBudget = parseFloat(total_cost);
        if (remarks !== undefined) updateData.remarks = remarks;

        if (fiscal_year) {
            const yearNum = parseInt(fiscal_year);
            const shortYear = yearNum > 2000 ? yearNum - 2000 : yearNum;
            const name = `FY${shortYear}`;
            const fy = await prisma.fiscalYear.findUnique({ where: { name } });
            if (fy) updateData.fiscalYearId = fy.id;
        }

        const lineItem = await prisma.lineItem.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                tower: true,
                budgetHead: true,
                poEntity: true,
                serviceType: true,
                allocationBasis: true,
                vendor: true
            }
        });

        res.json(lineItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a line item
const deleteLineItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lineItem.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Line item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLineItems,
    createLineItem,
    updateLineItem,
    deleteLineItem
};
