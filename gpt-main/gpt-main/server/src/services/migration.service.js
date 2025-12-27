const exceljs = require('exceljs');
const prisma = require('../prisma');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Migration Service
 * Implements the 10-Step Excel-to-DB migration process.
 * Optimized for performance and robustness.
 */

async function migrateExcel(buffer, userId, filename = 'EXCEL_IMPORT') {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1); // Assuming first sheet

    const rawRows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        rawRows.push(row);
    });

    const headers = sheet.getRow(1).values; 

    // Step 9: Execution Order starts here
    // 1️⃣ Step 4 & 9: Entity Master (Collect all unique entities from headers)
    const entitiesInSheet = new Set();
    const monthlyColumns = []; // Store { colIndex, month, entityName }
    const entityCountColumns = []; // Store { colIndex, entityName } for BOA allocation counts

    // First pass: identify monthly columns and collect entities
    headers.forEach((h, index) => {
        if (!h || typeof h !== 'string') return;
        const monthMatch = h.match(/^(\d{2})\s*-\s*(.+)$/);
        if (monthMatch) {
            const entityName = monthMatch[2].trim();
            entitiesInSheet.add(entityName);
            monthlyColumns.push({
                index,
                monthNo: parseInt(monthMatch[1]),
                entityName
            });
        }
    });

    // Find the last monthly column index
    const lastMonthlyColumnIndex = monthlyColumns.length > 0
        ? Math.max(...monthlyColumns.map(col => col.index))
        : 33; // Default to after FY Actuals column

    // Second pass: identify entity count columns (BOA allocation)
    // These appear after monthly columns and are just entity names (no month prefix)
    headers.forEach((h, index) => {
        if (!h || typeof h !== 'string') return;

        // Skip if it's a monthly column or before the expected BOA columns
        const isMonthlyColumn = /^\d{2}\s*-\s*.+$/.test(h);
        if (isMonthlyColumn || index <= lastMonthlyColumnIndex) return;

        // Skip known fixed columns
        const knownFixedColumns = [
            'uid', 'parent uid', 'vendor', 'vendor service', 'service', 'service description',
            'contract', 'service start date', 'service end date', 'renewal date',
            'budget head', 'tower', 'priority', 'initiative type', 'service type',
            'allocation type', 'cost optimization lever', 'remarks',
            'entity', 'pr number', 'pr date', 'pr amount', 'currency',
            'po number', 'po date', 'po value', 'common currency', 'common currency value inr',
            'basis of allocation', 'allocation basis', 'total count',
            'fy budget', 'fy actuals', 'fy26 budget', 'fy27 budget'
        ];

        const normalizedHeader = h.trim().toLowerCase();
        if (knownFixedColumns.includes(normalizedHeader)) return;

        // This is likely an entity count column
        const entityName = h.trim();
        entitiesInSheet.add(entityName);
        entityCountColumns.push({
            index,
            possibleEntityName: entityName
        });
    });

    logger.info(`Found ${entitiesInSheet.size} unique entities in Excel headers.`);
    logger.info(`Detected ${monthlyColumns.length} monthly columns and ${entityCountColumns.length} BOA allocation columns.`);

    if (monthlyColumns.length > 0) {
        logger.debug(`Monthly columns: ${monthlyColumns.map(c => `Col ${c.index}: ${c.monthNo}-${c.entityName}`).join(', ')}`);
    }

    if (entityCountColumns.length > 0) {
        logger.debug(`BOA allocation columns: ${entityCountColumns.map(c => `Col ${c.index}: ${c.possibleEntityName}`).join(', ')}`);
    }


    // Pre-create entities
    for (const entityName of entitiesInSheet) {
        await prisma.entityMaster.upsert({
            where: { entity_name: entityName },
            update: {},
            create: { entity_name: entityName }
        });
    }

    const entityLookup = await prisma.entityMaster.findMany();
    const entityMap = new Map(entityLookup.map(e => [e.entity_name, e.id]));

    let totalRecordsMigrated = 0;
    const batchSize = 100;

    for (let i = 0; i < rawRows.length; i += batchSize) {
        const batch = rawRows.slice(i, i + batchSize);

        await prisma.$transaction(async (tx) => {
            for (const row of batch) {
                const getVal = (idx) => {
                    const cell = row.getCell(idx);
                    if (!cell || cell.value === null || cell.value === undefined) return null;
                    if (cell.value && typeof cell.value === 'object') {
                        if (cell.value.result !== undefined) return cell.value.result;
                        if (cell.value instanceof Date) return cell.value;
                        if (cell.value.text !== undefined) return cell.value.text; // For rich text/hyperlinks
                    }
                    return cell.value;
                };

                const uid = getVal(1);
                if (!uid) continue;

                const parseDate = (val) => {
                    if (!val) return null;
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? null : d;
                };

                const serviceData = {
                    uid: String(uid),
                    parent_uid: String(getVal(2) || ''),
                    vendor: String(getVal(3) || ''),
                    vendor_service: String(getVal(4) || ''),
                    service: String(getVal(5) || ''),
                    service_description: String(getVal(6) || ''),
                    contract: String(getVal(7) || ''),
                    service_start_date: parseDate(getVal(8)),
                    service_end_date: parseDate(getVal(9)),
                    renewal_date: parseDate(getVal(10)),
                    budget_head: String(getVal(11) || ''),
                    tower: String(getVal(12) || ''),
                    priority: String(getVal(13) || ''),
                    initiative_type: String(getVal(14) || ''),
                    service_type: String(getVal(15) || ''),
                    allocation_type: String(getVal(16) || ''),
                    cost_optimization_lever: String(getVal(17) || ''),
                    remarks: String(getVal(18) || '')
                };

                // 1. Insert Service Master
                const service = await tx.serviceMaster.upsert({
                    where: { uid: serviceData.uid },
                    update: serviceData,
                    create: serviceData
                });

                // 2. Procurement Details
                await tx.procurementDetail.deleteMany({ where: { service_id: service.id } });
                await tx.procurementDetail.create({
                    data: {
                        service_id: service.id,
                        entity: String(getVal(19) || ''),
                        pr_number: String(getVal(20) || ''),
                        pr_date: parseDate(getVal(21)),
                        pr_amount: parseFloat(getVal(22)) || 0,
                        currency: String(getVal(23) || 'INR'),
                        po_number: String(getVal(24) || ''),
                        po_date: parseDate(getVal(25)),
                        po_value: parseFloat(getVal(26)) || 0,
                        common_currency: String(getVal(27) || 'INR'),
                        common_currency_value_inr: parseFloat(getVal(28)) || 0,
                        value_in_lac: (parseFloat(getVal(28)) || 0) / 100000
                    }
                });

                // 3. Allocation Basis
                await tx.allocationBasis.deleteMany({ where: { service_id: service.id } });
                await tx.allocationBasis.create({
                    data: {
                        service_id: service.id,
                        basis_of_allocation: String(getVal(29) || ''),
                        allocation_basis: String(getVal(30) || ''),
                        total_count: parseInt(getVal(31)) || 0
                    }
                });

                // 4. FY Totals
                const fyBudget = parseFloat(getVal(32)) || 0;
                const fyActualRaw = parseFloat(getVal(33)) || 0;

                await tx.fYActual.upsert({
                    where: {
                        service_id_financial_year: {
                            service_id: service.id,
                            financial_year: config.server.defaultFY
                        }
                    },
                    update: {
                        fy_budget: fyBudget,
                        fy_actuals: fyActualRaw
                    },
                    create: {
                        service_id: service.id,
                        financial_year: config.server.defaultFY,
                        fy_budget: fyBudget,
                        fy_actuals: fyActualRaw
                    }
                });

                // 5. Monthly Entity Actuals
                await tx.monthlyEntityActual.deleteMany({ where: { service_id: service.id } });

                let rowSum = 0;
                for (const col of monthlyColumns) {
                    const amount = parseFloat(getVal(col.index)) || 0;
                    if (amount !== 0) {
                        const entityId = entityMap.get(col.entityName);
                        if (entityId) {
                            await tx.monthlyEntityActual.create({
                                data: {
                                    service_id: service.id,
                                    entity_id: entityId,
                                    month_no: col.monthNo,
                                    amount: amount
                                }
                            });
                            rowSum += amount;
                        }
                    }
                }

                // 6. Entity Allocation Counts
                await tx.serviceEntityAllocation.deleteMany({ where: { service_id: service.id } });

                let calculatedTotalCount = 0;
                const entityAllocations = [];

                for (const col of entityCountColumns) {
                    const entityName = col.possibleEntityName;
                    const entityId = entityMap.get(entityName);

                    if (entityId) {
                        const count = parseFloat(getVal(col.index)) || 0;
                        if (count !== 0) {
                            entityAllocations.push({
                                service_id: service.id,
                                entity_id: entityId,
                                count: count
                            });
                            calculatedTotalCount += count;
                        }
                    }
                }

                // Create all entity allocations
                for (const allocation of entityAllocations) {
                    await tx.serviceEntityAllocation.create({ data: allocation });
                }

                // Update AllocationBasis with calculated total_count if we have entity allocations
                if (calculatedTotalCount > 0) {
                    const excelTotalCount = parseInt(getVal(31)) || 0;

                    // Validate if Excel total_count matches calculated total
                    if (excelTotalCount > 0 && Math.abs(excelTotalCount - calculatedTotalCount) > 0.01) {
                        logger.warn(`UID ${service.uid}: Total count mismatch. Excel: ${excelTotalCount}, Calculated: ${calculatedTotalCount}. Using calculated value.`);
                    }

                    // Update the AllocationBasis with the correct total_count
                    await tx.allocationBasis.updateMany({
                        where: { service_id: service.id },
                        data: { total_count: Math.round(calculatedTotalCount) }
                    });
                }


                if (Math.abs(rowSum - fyActualRaw) > 1.0) {
                    logger.warn(`UID ${service.uid}: Reconciliation mismatch. Row Sum (${rowSum}) vs FY Actuals (${fyActualRaw})`);
                }

                totalRecordsMigrated++;
            }
        });

        logger.info(`Migrated batch ending at row ${Math.min(i + batchSize, rawRows.length)}`);
    }

    // Create Import History record
    await prisma.importHistory.create({
        data: {
            type: 'MASTER_MIGRATION',
            filename: filename,
            totalRows: rawRows.length,
            acceptedRows: totalRecordsMigrated,
            rejectedRows: rawRows.length - totalRecordsMigrated,
            status: 'COMPLETED',
            userId: userId
        }
    });

    return {
        success: true,
        recordsMigrated: totalRecordsMigrated,
        entitiesDetected: entitiesInSheet.size
    };
}

module.exports = {
    migrateExcel
};

