const prisma = require('../prisma');

const getBudgets = async (req, res) => {
    try {
        const { fiscal_year } = req.query;
        const where = fiscal_year ? { fiscal_year: parseInt(fiscal_year) } : {};

        const budgets = await prisma.budgetBOA.findMany({
            where,
            include: {
                tower: true,
                budget_head: true,
                cost_centre: true,
                monthly_breakdown: true,
                calculations: true
            }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBudget = async (req, res) => {
    try {
        const {
            fiscal_year, tower_id, budget_head_id, cost_centre_id, allocation_basis_id,
            annual_budget_amount, remarks, monthly_breakdown
        } = req.body;

        const budget = await prisma.budgetBOA.create({
            data: {
                fiscal_year: parseInt(fiscal_year),
                tower_id: parseInt(tower_id),
                budget_head_id: parseInt(budget_head_id),
                cost_centre_id: parseInt(cost_centre_id),
                allocation_basis_id: allocation_basis_id ? parseInt(allocation_basis_id) : null,
                annual_budget_amount: parseFloat(annual_budget_amount),
                remarks,
                monthly_breakdown: {
                    create: monthly_breakdown.map(m => ({
                        month: m.month,
                        budget_amount: parseFloat(m.budget_amount)
                    }))
                }
            },
            include: {
                monthly_breakdown: true
            }
        });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { annual_budget_amount, remarks } = req.body;

        const budget = await prisma.budgetBOA.update({
            where: { id: parseInt(id) },
            data: {
                annual_budget_amount: parseFloat(annual_budget_amount),
                remarks
            }
        });
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBudgetTracker = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const skip = page * pageSize;

        // Optimized: usage of transaction for count and paginated data
        const [totalRows, lineItems] = await prisma.$transaction([
            prisma.lineItem.count(),
            prisma.lineItem.findMany({
                skip,
                take: pageSize,
                orderBy: { id: 'asc' }, // Ensure stable ordering
                select: {
                    id: true,
                    uid: true,
                    parentUid: true,
                    description: true,
                    remarks: true,
                    serviceStartDate: true,
                    serviceEndDate: true,
                    contractId: true,
                    tower: { select: { name: true } },
                    budgetHead: { select: { name: true } },
                    fiscalYear: { select: { name: true } },
                    vendor: { select: { name: true } },
                    poEntity: { select: { name: true } },
                    allocationBasis: { select: { name: true } },
                    serviceType: { select: { name: true } },
                    months: { select: { month: true, amount: true } },
                    actuals: { select: { amount: true } },
                    renewalDate: true,
                    initiativeType: true,
                    priority: true,
                    costOptimizationLever: true,
                    allocationType: true,
                    customFields: true
                }
            })
        ]);

        // Extract UIDs to calculate global totals for the items on THIS page only
        const uniqueUids = [...new Set(lineItems.map(i => i.uid).filter(Boolean))];
        const uidTotals = {};

        // Fetch all related items for these UIDs to calculate accurate totals (even for off-page items)
        if (uniqueUids.length > 0) {
            const relatedItems = await prisma.lineItem.findMany({
                where: { uid: { in: uniqueUids } },
                select: {
                    uid: true,
                    fiscalYear: { select: { name: true } },
                    months: { select: { amount: true } },
                    actuals: { select: { amount: true } }
                }
            });

            // Aggregate totals in memory (efficient since we only fetch for ~25 UIDs)
            relatedItems.forEach(item => {
                if (!uidTotals[item.uid]) {
                    uidTotals[item.uid] = {
                        fy25_budget: 0, fy25_actuals: 0,
                        fy26_budget: 0, fy26_actuals: 0,
                        fy27_budget: 0, fy27_actuals: 0
                    };
                }

                const monthlyBudget = item.months.reduce((sum, m) => sum + m.amount, 0);
                const actualAmount = item.actuals.reduce((sum, a) => sum + a.amount, 0);
                const fyName = item.fiscalYear?.name;

                if (fyName === 'FY25') {
                    uidTotals[item.uid].fy25_budget += monthlyBudget;
                    uidTotals[item.uid].fy25_actuals += actualAmount;
                } else if (fyName === 'FY26') {
                    uidTotals[item.uid].fy26_budget += monthlyBudget;
                    uidTotals[item.uid].fy26_actuals += actualAmount;
                } else if (fyName === 'FY27') {
                    uidTotals[item.uid].fy27_budget += monthlyBudget;
                    uidTotals[item.uid].fy27_actuals += actualAmount;
                }
            });
        }

        const trackerData = lineItems.map(item => {
            // Calculate individual line item values
            const monthlyBudget = item.months.reduce((sum, m) => sum + m.amount, 0);
            const actualAmount = item.actuals.reduce((sum, a) => sum + a.amount, 0);
            let fy25Budget = 0, fy25Actuals = 0, fy26Budget = 0, fy26Actuals = 0, fy27Budget = 0, fy27Actuals = 0;

            const fyName = item.fiscalYear?.name;
            if (fyName === 'FY25') { fy25Budget = monthlyBudget; fy25Actuals = actualAmount; }
            else if (fyName === 'FY26') { fy26Budget = monthlyBudget; fy26Actuals = actualAmount; }
            else if (fyName === 'FY27') { fy27Budget = monthlyBudget; fy27Actuals = actualAmount; }

            const totals = uidTotals[item.uid] || {
                fy25_budget: 0, fy25_actuals: 0,
                fy26_budget: 0, fy26_actuals: 0,
                fy27_budget: 0, fy27_actuals: 0
            };

            return {
                id: item.id,
                uid: item.uid,
                parent_uid: item.parentUid,
                vendor_name: item.vendor?.name || '-',
                service_description: item.description,
                service_start_date: item.serviceStartDate,
                service_end_date: item.serviceEndDate,
                renewal_date: item.renewalDate,
                initiative_type: item.initiativeType || '-',
                priority: item.priority || '-',
                cost_optimization_lever: item.costOptimizationLever || '-',
                allocation_type: item.allocationType || '-',
                customFields: item.customFields,

                budget_head_name: item.budgetHead?.name || '-',
                tower_name: item.tower?.name || '-',
                contract_id: item.contractId || '-',
                po_entity_name: item.poEntity?.name || '-',
                allocation_basis_name: item.allocationBasis?.name || '-',
                service_type_name: item.serviceType?.name || '-',

                // Current Item Values
                fy25_budget: fy25Budget,
                fy25_actuals: fy25Actuals,
                fy26_budget: fy26Budget,
                fy26_actuals: fy26Actuals,
                fy27_budget: fy27Budget,
                fy27_actuals: fy27Actuals,

                // UID Totals (Global)
                uid_total_fy25_budget: totals.fy25_budget,
                uid_total_fy25_actuals: totals.fy25_actuals,
                uid_total_fy26_budget: totals.fy26_budget,
                uid_total_fy26_actuals: totals.fy26_actuals,
                uid_total_fy27_budget: totals.fy27_budget,
                uid_total_fy27_actuals: totals.fy27_actuals,

                // Combined Totals for Display
                total_budget: totals.fy25_budget + totals.fy26_budget + totals.fy27_budget,
                total_actual: totals.fy25_actuals + totals.fy26_actuals + totals.fy27_actuals,

                remarks: item.remarks,
                monthly_data: item.months || [],
                actual_items: item.actuals || [],
                fiscal_year_name: item.fiscalYear?.name
            };
        });

        res.json({
            rows: trackerData,
            totalRowCount: totalRows
        });
    } catch (error) {
        console.error('Error in getBudgetTracker:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateLineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Remove fields that shouldn't be updated directly or need special handling
        const {
            id: _,
            monthly_data,
            actual_items,
            uid_total_fy25_budget,
            uid_total_fy25_actuals,
            // ... other calculated fields
            ...updateData
        } = data;

        // Map frontend field names to database schema names if necessary
        const allowedUpdates = {};
        if (data.uid) allowedUpdates.uid = data.uid;
        if (data.parent_uid) allowedUpdates.parentUid = data.parent_uid;
        if (data.service_description) allowedUpdates.description = data.service_description;
        if (data.remarks) allowedUpdates.remarks = data.remarks;
        if (data.contract_id) allowedUpdates.contractId = data.contract_id;
        if (data.initiative_type) allowedUpdates.initiativeType = data.initiative_type;
        if (data.priority) allowedUpdates.priority = data.priority;
        if (data.cost_optimization_lever) allowedUpdates.costOptimizationLever = data.cost_optimization_lever;
        if (data.allocation_type) allowedUpdates.allocationType = data.allocation_type;

        // Date fields handling
        if (data.service_start_date) allowedUpdates.serviceStartDate = new Date(data.service_start_date);
        if (data.service_end_date) allowedUpdates.serviceEndDate = new Date(data.service_end_date);
        if (data.renewal_date) allowedUpdates.renewalDate = new Date(data.renewal_date);

        // Update the line item
        const lineItem = await prisma.lineItem.update({
            where: { id: parseInt(id) },
            data: allowedUpdates
        });

        res.json(lineItem);
    } catch (error) {
        console.error('Error updating line item:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBudgets, createBudget, updateBudget, getBudgetTracker, updateLineItem };
