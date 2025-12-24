const prisma = require('../prisma');
const logger = require('../utils/logger');
const auditService = require('../services/audit.service');

/**
 * XLS Tracker Controller
 * Handles the logic for the Business Object model
 */

const getTrackerData = async (req, res) => {
    try {
        const { fy = 'FY25', page = 0, pageSize = 100, search = '', sortModel } = req.query;
        const skip = parseInt(page) * parseInt(pageSize);
        const take = parseInt(pageSize);

        // Build where clause for search
        const where = search ? {
            OR: [
                { uid: { contains: search } },
                { vendor: { contains: search } },
                { service: { contains: search } },
                { tower: { contains: search } },
                { budget_head: { contains: search } }
            ]
        } : {};

        // Build orderBy
        let orderBy = { uid: 'asc' };
        if (sortModel) {
            try {
                const parsedSort = JSON.parse(sortModel);
                if (parsedSort.length > 0) {
                    orderBy = { [parsedSort[0].field]: parsedSort[0].sort };
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Fetch ServiceMaster joined with FYActuals and Procurement with pagination
        const [services, totalCount] = await Promise.all([
            prisma.serviceMaster.findMany({
                where,
                skip,
                take,
                include: {
                    fy_actuals: {
                        where: { financial_year: fy }
                    },
                    procurement_details: true,
                    allocation_bases: true
                },
                orderBy
            }),
            prisma.serviceMaster.count({ where })
        ]);

        // Flatten for frontend DataGrid consumption
        const rows = services.map(s => {
            const fyData = s.fy_actuals[0] || {};
            const proc = s.procurement_details[0] || {};
            const alloc = s.allocation_bases[0] || {};

            return {
                id: s.id,
                fy_year: fy, // Requested 'FY Year'
                uid: s.uid,
                parent_uid: s.parent_uid,
                vendor: s.vendor,
                service: s.service,
                description: s.service_description,
                service_start_date: s.service_start_date,
                service_end_date: s.service_end_date,
                renewal_month: s.renewal_date, // Mapped to Renewal Month
                budget_head: s.budget_head,
                tower: s.tower,
                contract: s.contract,
                po_entity: proc.entity, // Sourced from Procurement
                allocation_type: s.allocation_type,
                allocation_basis: alloc.basis_of_allocation, // Sourced from AllocationBasis
                initiative_type: s.initiative_type,
                service_type: s.service_type,
                priority: s.priority,
                // Control Numbers
                fy_budget: fyData.fy_budget || 0, // 'Budget'
                fy_actuals: fyData.fy_actuals || 0, // 'Actual'
                variance: (fyData.fy_budget || 0) - (fyData.fy_actuals || 0),
                // Procurement info
                currency: proc.currency || 'INR',
                po_number: proc.po_number,
                po_value: proc.po_value,
                common_currency_value_inr: proc.common_currency_value_inr, // 'Value in INR'
                value_in_lac: (proc.common_currency_value_inr || 0) / 100000, // 'Value in Lakh'
                remarks: s.remarks
            };
        });

        res.json({
            rows,
            totalCount
        });
    } catch (error) {
        logger.error('Get Tracker Data Error: %s', error.stack);
        res.status(500).json({ message: 'Error retrieving tracker data' });
    }
};

/**
 * Net Budget Tracker Logic
 * Aggregate totals at the UID level for high-volume view
 */
const getNetBudgetTracker = async (req, res) => {
    try {
        const { page = 0, pageSize = 25, fy = 'FY25', search = '' } = req.query;
        const skip = parseInt(page) * parseInt(pageSize);
        const take = parseInt(pageSize);

        const where = search ? {
            OR: [
                { uid: { contains: search } },
                { vendor: { contains: search } },
                { service_description: { contains: search } },
                { tower: { contains: search } }
            ]
        } : {};

        const [services, totalRowCount] = await Promise.all([
            prisma.serviceMaster.findMany({
                where,
                skip,
                take,
                include: {
                    fy_actuals: {
                        where: { financial_year: fy }
                    },
                    procurement_details: true
                },
                orderBy: { uid: 'asc' }
            }),
            prisma.serviceMaster.count({ where })
        ]);

        const rows = services.map(s => {
            const fyData = s.fy_actuals[0] || { fy_budget: 0, fy_actuals: 0 };
            const proc = s.procurement_details[0] || { po_value: 0 };

            const totalBudget = fyData.fy_budget || 0;
            const allocatedPO = proc.po_value || 0;
            const consumedActuals = fyData.fy_actuals || 0;
            const netAvailable = totalBudget - allocatedPO;
            const utilizationPercentage = totalBudget > 0 ? (consumedActuals / totalBudget) * 100 : 0;

            return {
                id: s.id,
                uid: s.uid,
                description: s.service_description || s.service,
                vendor_name: s.vendor,
                tower_name: s.tower,
                budget_head_name: s.budget_head,
                fiscal_year_name: fy,
                total_budget: totalBudget,
                allocated_po: allocatedPO,
                consumed_actuals: consumedActuals,
                net_available: netAvailable,
                utilization_percentage: utilizationPercentage
            };
        });

        res.json({
            rows,
            totalRowCount
        });
    } catch (error) {
        logger.error('Net Budget Tracker Error: %s', error.stack);
        res.status(500).json({ message: 'Error fetching net budget data' });
    }
};

const getEntitySplits = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const splits = await prisma.monthlyEntityActual.findMany({
            where: { service_id: parseInt(serviceId) },
            include: { entity: true },
            orderBy: [{ month_no: 'asc' }, { entity_id: 'asc' }]
        });
        res.json(splits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMonthlyActual = async (req, res) => {
    try {
        const { service_id, entity_id, month_no, amount } = req.body;

        if (!service_id || !entity_id || !month_no) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const monthlyRecord = await tx.monthlyEntityActual.upsert({
                where: {
                    service_id_entity_id_month_no: {
                        service_id: parseInt(service_id),
                        entity_id: parseInt(entity_id),
                        month_no: parseInt(month_no)
                    }
                },
                update: { amount: parseFloat(amount) },
                create: {
                    service_id: parseInt(service_id),
                    entity_id: parseInt(entity_id),
                    month_no: parseInt(month_no),
                    amount: parseFloat(amount)
                }
            });

            const totalActual = await tx.monthlyEntityActual.aggregate({
                where: { service_id: parseInt(service_id) },
                _sum: { amount: true }
            });

            await tx.fYActual.update({
                where: {
                    service_id_financial_year: {
                        service_id: parseInt(service_id),
                        financial_year: 'FY25'
                    }
                },
                data: { fy_actuals: totalActual._sum.amount || 0 }
            });

            return monthlyRecord;
        }, {
            timeout: 10000
        });



        // Audit the change
        if (req.user) {
            await auditService.logAction(
                req.user.id,
                'UPDATE_MONTHLY_ACTUAL',
                'MonthlyEntityActual',
                result.id,
                { year: 'FY25', month_no, service_id }, // Context
                { amount },
                req.body.auditComment || 'Split Update'
            );
        }

        res.json({
            message: 'Spend updated successfully',
            data: result
        });
    } catch (error) {
        logger.error('Update Monthly Actual Error: %s', error.stack);
        res.status(400).json({
            message: 'Failed to update spend split',
            error: error.message
        });
    }
};

const updateTrackerRow = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const comment = data.auditComment || 'Direct Update';
        const fy = 'FY25';

        // Fetch old state for auditing
        const oldState = await prisma.serviceMaster.findUnique({
            where: { id: parseInt(id) },
            include: {
                fy_actuals: { where: { financial_year: fy } },
                procurement_details: true,
                allocation_bases: true
            }
        });

        if (!oldState) return res.status(404).json({ message: 'Record not found' });

        // Field mapping groups
        const serviceFields = [
            'uid', 'parent_uid', 'vendor', 'service', 'description',
            'service_start_date', 'service_end_date', 'renewal_date',
            'contract', 'tower', 'budget_head', 'allocation_type',
            'initiative_type', 'service_type', 'priority', 'remarks'
        ];
        const procurementFields = ['po_number', 'po_value', 'currency', 'common_currency_value_inr', 'po_entity'];
        const fyFields = ['fy_budget'];

        const serviceUpdate = {};
        const procurementUpdate = {};
        const fyUpdate = {};

        Object.keys(data).forEach(key => {
            if (serviceFields.includes(key) || key === 'renewal_month') {
                const dbKey = key === 'description' ? 'service_description' :
                    key === 'renewal_month' ? 'renewal_date' : key;
                serviceUpdate[dbKey] = data[key];
            } else if (procurementFields.includes(key)) {
                const dbKey = key === 'po_entity' ? 'entity' : key;
                procurementUpdate[dbKey] = data[key];
            } else if (fyFields.includes(key)) {
                fyUpdate[key] = parseFloat(data[key]);
            }
        });

        if (procurementUpdate.common_currency_value_inr) {
            procurementUpdate.value_in_lac = parseFloat(procurementUpdate.common_currency_value_inr) / 100000;
        }

        const result = await prisma.$transaction(async (tx) => {
            if (Object.keys(serviceUpdate).length > 0) {
                await tx.serviceMaster.update({ where: { id: parseInt(id) }, data: serviceUpdate });
            }
            if (data.allocation_basis !== undefined) {
                const existing = await tx.allocationBasis.findFirst({ where: { service_id: parseInt(id) } });
                if (existing) await tx.allocationBasis.update({ where: { id: existing.id }, data: { basis_of_allocation: data.allocation_basis } });
                else await tx.allocationBasis.create({ data: { service_id: parseInt(id), basis_of_allocation: data.allocation_basis } });
            }
            if (Object.keys(procurementUpdate).length > 0) {
                const existing = await tx.procurementDetail.findFirst({ where: { service_id: parseInt(id) } });
                if (existing) await tx.procurementDetail.update({ where: { id: existing.id }, data: procurementUpdate });
                else await tx.procurementDetail.create({ data: { service_id: parseInt(id), ...procurementUpdate } });
            }
            if (Object.keys(fyUpdate).length > 0) {
                const existing = await tx.fYActual.findUnique({ where: { service_id_financial_year: { service_id: parseInt(id), financial_year: fy } } });
                if (existing) await tx.fYActual.update({ where: { id: existing.id }, data: fyUpdate });
                else await tx.fYActual.create({ data: { service_id: parseInt(id), financial_year: fy, ...fyUpdate } });
            }
            return true;
        });

        // Audit Logging
        if (req.user) {
            await auditService.logAction(
                req.user.id,
                'UPDATE_TRACKER_ROW',
                'ServiceMaster',
                parseInt(id),
                oldState,    // Detailed old state
                data,        // The changes requested
                comment      // Mandatory reason
            );
        }

        res.json({ message: 'Row updated successfully' });
    } catch (error) {
        logger.error('Update Tracker Row Error: %s', error.stack);
        res.status(500).json({ message: 'Error updating row', error: error.message });
    }
};

module.exports = {
    getTrackerData,
    getNetBudgetTracker,
    getEntitySplits,
    updateMonthlyActual,
    updateTrackerRow
};

