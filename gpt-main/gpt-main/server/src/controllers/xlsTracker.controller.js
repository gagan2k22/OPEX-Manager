const prisma = require('../prisma');
const logger = require('../utils/logger');
const auditService = require('../services/audit.service');
const config = require('../config');
const cache = require('../utils/cache');
const { trackerUpdateSchema, monthlyActualUpdateSchema } = require('../utils/validations');
const migrationService = require('../services/migration.service'); // Reuse existing service or new logic
const boaAllocationService = require('../services/boaAllocation.service'); // BOA-specific import

/**
 * XLS Tracker Controller
 * Handles the logic for the Business Object model
 */

const getTrackerData = async (req, res) => {
    try {
        const { fy = config.server.defaultFY, page = 0, pageSize = 100, search = '', sortModel } = req.query;

        // Generate cache key based on query parameters
        const cacheKey = `tracker:${fy}:${page}:${pageSize}:${search}:${sortModel || 'default'}`;

        // Check cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            logger.debug(`Cache HIT for tracker data: ${cacheKey}`);
            return res.json(cachedData);
        }

        logger.debug(`Cache MISS for tracker data: ${cacheKey}`);

        // Calculate previous 2 years
        const currentYearNum = parseInt(fy.replace(/\D/g, ''));
        const fyPrev1 = `FY${currentYearNum - 1}`;
        const fyPrev2 = `FY${currentYearNum - 2}`;
        const fyList = [fy, fyPrev1, fyPrev2];
        const skip = parseInt(page) * parseInt(pageSize);
        const take = parseInt(pageSize);

        // Build where clause for search
        const where = search ? {
            OR: [
                { uid: { contains: search } },
                { vendor: { contains: search } },
                { service: { contains: search } },
                { tower: { contains: search } },
                { budget_head: { contains: search } },
                { remarks: { contains: search } }
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
                select: {
                    id: true,
                    uid: true,
                    parent_uid: true,
                    vendor: true,
                    service: true,
                    service_description: true,
                    service_start_date: true,
                    service_end_date: true,
                    renewal_date: true,
                    budget_head: true,
                    tower: true,
                    contract: true,
                    allocation_type: true,
                    initiative_type: true,
                    service_type: true,
                    priority: true,
                    remarks: true,
                    fy_actuals: {
                        where: { financial_year: { in: fyList } },
                        select: {
                            financial_year: true,
                            fy_budget: true,
                            fy_actuals: true
                        }
                    },
                    procurement_details: {
                        select: {
                            entity: true,
                            pr_number: true,
                            pr_date: true,
                            pr_amount: true,
                            currency: true,
                            po_number: true,
                            po_date: true,
                            po_value: true,
                            common_currency: true,
                            common_currency_value_inr: true
                        }
                    },
                    allocation_bases: {
                        select: {
                            basis_of_allocation: true
                        }
                    }
                },
                orderBy
            }),
            prisma.serviceMaster.count({ where })
        ]);

        // Flatten for frontend DataGrid consumption
        const rows = services.map(s => {
            const fyDataCurrent = s.fy_actuals.find(f => f.financial_year === fy) || {};
            const fyDataPrev1 = s.fy_actuals.find(f => f.financial_year === fyPrev1) || {};
            const fyDataPrev2 = s.fy_actuals.find(f => f.financial_year === fyPrev2) || {};

            const fyData = fyDataCurrent; // Keep existing reference for backward compatibility
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
                po_entity: proc.entity || '', // Sourced from Procurement
                allocation_type: s.allocation_type,
                allocation_basis: alloc.basis_of_allocation, // Sourced from AllocationBasis
                initiative_type: s.initiative_type,
                service_type: s.service_type,
                priority: s.priority,
                // Control Numbers
                fy_budget: fyData.fy_budget || 0, // 'Budget'
                fy_actuals: fyData.fy_actuals || 0, // 'Actual'
                variance: (fyData.fy_budget || 0) - (fyData.fy_actuals || 0),

                // Historical Data
                [`budget_${fyPrev1}`]: fyDataPrev1.fy_budget || 0,
                [`actuals_${fyPrev1}`]: fyDataPrev1.fy_actuals || 0,
                [`budget_${fyPrev2}`]: fyDataPrev2.fy_budget || 0,
                [`actuals_${fyPrev2}`]: fyDataPrev2.fy_actuals || 0,

                // Procurement info
                pr_number: proc.pr_number,
                pr_date: proc.pr_date,
                pr_amount: proc.pr_amount,
                currency: proc.currency || 'INR',
                po_number: proc.po_number,
                po_date: proc.po_date,
                po_value: proc.po_value,
                po_currency: proc.common_currency || proc.currency || 'INR',
                common_currency_value_inr: proc.common_currency_value_inr, // 'Value in INR'
                value_in_lac: (proc.common_currency_value_inr || 0) / 100000, // 'Value in Lakh'
                remarks: s.remarks
            };
        });

        const responseData = {
            rows,
            totalCount
        };

        // Cache the result for 2 minutes (120 seconds)
        await cache.set(cacheKey, responseData, 120);

        res.json(responseData);
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
        const { page = 0, pageSize = 25, fy = config.server.defaultFY, search = '', sortModel } = req.query;
        const skip = parseInt(page) * parseInt(pageSize);
        const take = parseInt(pageSize);

        const where = search ? {
            OR: [
                { uid: { contains: search } },
                { vendor: { contains: search } },
                { service_description: { contains: search } },
                { tower: { contains: search } },
                { budget_head: { contains: search } },
                { remarks: { contains: search } }
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
            } catch (e) { /* fallback */ }
        }

        const [entities, totalRowCount] = await Promise.all([
            prisma.entityMaster.findMany({ orderBy: { entity_name: 'asc' } }),
            prisma.serviceMaster.count({ where })
        ]);

        const services = await prisma.serviceMaster.findMany({
            where,
            skip,
            take,
            include: {
                fy_actuals: {
                    where: { financial_year: fy }
                },
                procurement_details: true,
                monthly_actuals: {
                    include: {
                        entity: true
                    }
                }
            },
            orderBy
        });

        const rows = services.map(s => {
            const fyData = s.fy_actuals[0] || { fy_budget: 0, fy_actuals: 0 };
            const proc = s.procurement_details[0] || { entity: '', po_value: 0 };

            const row = {
                id: s.id,
                uid: s.uid,
                vendor: s.vendor,
                service_description: s.service_description || s.service,
                service_start_date: s.service_start_date,
                service_end_date: s.service_end_date,
                renewal_date: s.renewal_date,
                budget_head: s.budget_head,
                tower: s.tower,
                po_entity: proc.entity,
                service_type: s.service_type,
                initiative_type: s.initiative_type,
                remarks: s.remarks,
                total_budget: fyData.fy_budget || 0,
                total_actuals: fyData.fy_actuals || 0,
                // Add split data
                ...s.monthly_actuals.reduce((acc, split) => {
                    const monthKey = split.month_no.toString().padStart(2, '0');
                    const key = `${monthKey} - ${split.entity.entity_name}`;
                    acc[key] = split.amount;
                    return acc;
                }, {})
            };

            return row;
        });

        res.json({
            rows,
            entities: entities.map(e => e.entity_name),
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
                        financial_year: config.server.defaultFY
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
                { year: config.server.defaultFY, month_no, service_id }, // Context
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
        const validatedData = trackerUpdateSchema.parse(req.body);
        const { id } = req.params;
        const comment = validatedData.auditComment || 'Direct Update';
        const fy = config.server.defaultFY;

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
            'service_start_date', 'service_end_date', 'renewal_date', 'renewal_month',
            'contract', 'tower', 'budget_head', 'allocation_type',
            'initiative_type', 'service_type', 'priority', 'remarks'
        ];
        const procurementFields = [
            'po_number', 'po_value', 'currency', 'common_currency_value_inr', 'po_entity',
            'pr_number', 'pr_date', 'pr_amount', 'po_date', 'common_currency', 'po_currency'
        ];
        const fyFields = ['fy_budget'];

        const serviceUpdate = {};
        const procurementUpdate = {};
        const fyUpdate = {};

        Object.keys(validatedData).forEach(key => {
            if (serviceFields.includes(key)) {
                let dbKey = key;
                if (key === 'description') dbKey = 'service_description';
                if (key === 'renewal_month') dbKey = 'renewal_date';

                // Handle dates
                if (['service_start_date', 'service_end_date', 'renewal_date'].includes(dbKey)) {
                    serviceUpdate[dbKey] = validatedData[key] ? new Date(validatedData[key]) : null;
                } else {
                    serviceUpdate[dbKey] = validatedData[key];
                }
            } else if (procurementFields.includes(key)) {
                let dbKey = key === 'po_entity' ? 'entity' : key;
                if (key === 'po_currency') dbKey = 'common_currency';

                if (['pr_date', 'po_date'].includes(dbKey)) {
                    procurementUpdate[dbKey] = validatedData[key] ? new Date(validatedData[key]) : null;
                } else {
                    procurementUpdate[dbKey] = validatedData[key];
                }
            } else if (fyFields.includes(key)) {
                fyUpdate[key] = parseFloat(validatedData[key]);
            }
        });

        if (procurementUpdate.common_currency_value_inr) {
            procurementUpdate.value_in_lac = parseFloat(procurementUpdate.common_currency_value_inr) / 100000;
        }

        await prisma.$transaction(async (tx) => {
            if (Object.keys(serviceUpdate).length > 0) {
                await tx.serviceMaster.update({ where: { id: parseInt(id) }, data: serviceUpdate });
            }
            if (validatedData.allocation_basis !== undefined) {
                const existing = await tx.allocationBasis.findFirst({ where: { service_id: parseInt(id) } });
                if (existing) {
                    await tx.allocationBasis.update({ where: { id: existing.id }, data: { basis_of_allocation: validatedData.allocation_basis } });
                } else {
                    await tx.allocationBasis.create({ data: { service_id: parseInt(id), basis_of_allocation: validatedData.allocation_basis } });
                }
            }
            if (Object.keys(procurementUpdate).length > 0) {
                const existing = await tx.procurementDetail.findFirst({ where: { service_id: parseInt(id) } });
                if (existing) {
                    await tx.procurementDetail.update({ where: { id: existing.id }, data: procurementUpdate });
                } else {
                    await tx.procurementDetail.create({ data: { service_id: parseInt(id), ...procurementUpdate } });
                }
            }
            if (Object.keys(fyUpdate).length > 0) {
                const existing = await tx.fYActual.findUnique({
                    where: { service_id_financial_year: { service_id: parseInt(id), financial_year: fy } }
                });
                if (existing) {
                    await tx.fYActual.update({ where: { id: existing.id }, data: fyUpdate });
                } else {
                    await tx.fYActual.create({ data: { service_id: parseInt(id), financial_year: fy, ...fyUpdate } });
                }
            }
        });

        // Audit Logging
        if (req.user) {
            await auditService.logAction(
                req.user.id,
                'UPDATE_TRACKER_ROW',
                'ServiceMaster',
                parseInt(id),
                oldState,
                validatedData,
                comment
            );
        }

        // Handle Remark Logging if remarks changed
        if (Object.keys(serviceUpdate).includes('remarks') && serviceUpdate.remarks) {
            await prisma.serviceRemarkLog.create({
                data: {
                    service_id: parseInt(id),
                    remark: serviceUpdate.remarks,
                    user_name: req.user?.name || 'System'
                }
            });
        }

        // Invalidate tracker cache after update
        await cache.invalidatePattern('tracker:*');

        res.json({ message: 'Row updated successfully' });
    } catch (error) {
        logger.error('Update Tracker Row Error: %s', error.stack);
        res.status(500).json({ message: 'Error updating row', error: error.message });
    }
};

const getBOAAllocationData = async (req, res) => {
    try {
        const { fy = config.server.defaultFY } = req.query;

        const [services, entities] = await Promise.all([
            prisma.serviceMaster.findMany({
                include: {
                    allocation_bases: true,
                    entity_allocations: {
                        include: { entity: true }
                    }
                },
                orderBy: { uid: 'asc' }
            }),
            prisma.entityMaster.findMany({ orderBy: { entity_name: 'asc' } })
        ]);

        const rows = services.map(s => {
            const alloc = s.allocation_bases[0] || { basis_of_allocation: '-', total_count: 0 };

            // Get entity counts from entity_allocations
            const entityCounts = {};
            s.entity_allocations.forEach(ea => {
                entityCounts[ea.entity.entity_name] = ea.count;
            });

            const row = {
                id: s.id,
                service_uid: s.uid,
                service_name: s.service || s.service_description,
                basis: alloc.basis_of_allocation,
                total_count: alloc.total_count || 0
            };

            const totalCount = row.total_count;

            entities.forEach(e => {
                const entityCount = entityCounts[e.entity_name] || 0;
                // Percentage = (entity_count / total_count) * 100
                const percentage = totalCount > 0 ? (entityCount / totalCount) * 100 : 0;

                row[e.entity_name] = entityCount; // Absolute Value (Table 1)
                row[`pct_${e.entity_name}`] = percentage; // Percentage Value (Table 2)
            });

            return row;
        });

        res.json({
            rows,
            entities: entities.map(e => e.entity_name)
        });
    } catch (error) {
        logger.error('Get BOA Allocation Data Error: %s', error.stack);
        res.status(500).json({ message: 'Error fetching BOA allocation data' });
    }
};

const getRemarkLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await prisma.serviceRemarkLog.findMany({
            where: { service_id: parseInt(id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching remarks', error: error.message });
    }
};

const deleteRemarkLog = async (req, res) => {
    try {
        const { logId } = req.params;
        await prisma.serviceRemarkLog.delete({ where: { id: parseInt(logId) } });
        res.json({ message: 'Remark log deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting remark log', error: error.message });
    }
};

const importBOAAllocation = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        logger.info(`Starting BOA Allocation import for file: ${req.file.originalname} (User: ${req.user.email})`);

        // Use dedicated BOA allocation service for simplified Excel format
        const result = await boaAllocationService.importBOAAllocation(req.file.buffer, req.user.id, req.file.originalname);

        // Audit log
        await auditService.logAction(
            req.user.id,
            'IMPORT_BOA_ALLOCATION',
            'AllocationBasis',
            0,
            { filename: req.file.originalname },
            { stats: result }
        );

        res.json({
            message: 'BOA Allocation updated successfully',
            details: result
        });
    } catch (error) {
        logger.error('Import BOA Allocation Error: %s', error.stack);
        res.status(500).json({
            message: 'Error during import process',
            error: error.message
        });
    }
};

module.exports = {
    getTrackerData,
    getNetBudgetTracker,
    getEntitySplits,
    updateMonthlyActual,
    updateTrackerRow,
    getBOAAllocationData,
    getRemarkLogs,
    deleteRemarkLog,
    importBOAAllocation
};

