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
        // Optimized: Only select necessary fields to reduce data transfer
        const lineItems = await prisma.lineItem.findMany({
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
                actuals: { select: { amount: true } }
            }
        });

        // Pre-calculate UID totals in a single pass
        const uidTotals = {};
        const trackerData = [];

        lineItems.forEach(item => {
            // Initialize UID totals if not exists
            if (!uidTotals[item.uid]) {
                uidTotals[item.uid] = {
                    fy25_budget: 0,
                    fy25_actuals: 0,
                    fy26_budget: 0,
                    fy26_actuals: 0,
                    fy27_budget: 0,
                    fy27_actuals: 0
                };
            }

            // Calculate monthly budget and actuals
            const monthlyBudget = item.months.reduce((sum, m) => sum + m.amount, 0);
            const actualAmount = item.actuals.reduce((sum, a) => sum + a.amount, 0);

            // Determine fiscal year and assign values
            let fy25Budget = 0, fy25Actuals = 0;
            let fy26Budget = 0, fy26Actuals = 0;
            let fy27Budget = 0, fy27Actuals = 0;

            if (item.fiscalYear) {
                const fyName = item.fiscalYear.name;
                if (fyName === 'FY25') {
                    fy25Budget = monthlyBudget;
                    fy25Actuals = actualAmount;
                    uidTotals[item.uid].fy25_budget += monthlyBudget;
                    uidTotals[item.uid].fy25_actuals += actualAmount;
                } else if (fyName === 'FY26') {
                    fy26Budget = monthlyBudget;
                    fy26Actuals = actualAmount;
                    uidTotals[item.uid].fy26_budget += monthlyBudget;
                    uidTotals[item.uid].fy26_actuals += actualAmount;
                } else if (fyName === 'FY27') {
                    fy27Budget = monthlyBudget;
                    fy27Actuals = actualAmount;
                    uidTotals[item.uid].fy27_budget += monthlyBudget;
                    uidTotals[item.uid].fy27_actuals += actualAmount;
                }
            }

            // Build tracker row
            trackerData.push({
                id: item.id,
                uid: item.uid,
                parent_uid: item.parentUid,
                vendor_name: item.vendor?.name || '-',
                service_description: item.description,
                service_start_date: item.serviceStartDate,
                service_end_date: item.serviceEndDate,
                is_renewal: false, // You might need logic for this
                budget_head_name: item.budgetHead?.name || '-',
                tower_name: item.tower?.name || '-',
                contract_id: item.contractId || '-',
                po_entity_name: item.poEntity?.name || '-',
                allocation_basis_name: item.allocationBasis?.name || '-',
                service_type_name: item.serviceType?.name || '-',

                // Individual fiscal year data
                fy25_budget: fy25Budget,
                fy25_actuals: fy25Actuals,
                fy26_budget: fy26Budget,
                fy26_actuals: fy26Actuals,
                fy27_budget: fy27Budget,
                fy27_actuals: fy27Actuals,

                // UID totals (will be filled in next step)
                uid_total_fy25_budget: 0,
                uid_total_fy25_actuals: 0,
                uid_total_fy26_budget: 0,
                uid_total_fy26_actuals: 0,
                uid_total_fy27_budget: 0,
                uid_total_fy27_actuals: 0,

                remarks: item.remarks,
                monthly_data: item.months || [],
                actual_items: item.actuals || [],
                fiscal_year_name: item.fiscalYear?.name
            });
        });

        // Fill in UID totals in a second pass
        trackerData.forEach(row => {
            const totals = uidTotals[row.uid];
            row.uid_total_fy25_budget = totals.fy25_budget;
            row.uid_total_fy25_actuals = totals.fy25_actuals;
            row.uid_total_fy26_budget = totals.fy26_budget;
            row.uid_total_fy26_actuals = totals.fy26_actuals;
            row.uid_total_fy27_budget = totals.fy27_budget;
            row.uid_total_fy27_actuals = totals.fy27_actuals;
        });

        res.json(trackerData);
    } catch (error) {
        console.error('Error in getBudgetTracker:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBudgets, createBudget, updateBudget, getBudgetTracker };
