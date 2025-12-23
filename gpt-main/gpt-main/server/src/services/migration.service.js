const exceljs = require('exceljs');
const prisma = require('../prisma');
const logger = require('../utils/logger');

/**
 * Migration Service
 * Implements the 10-Step Excel-to-DB migration process.
 */

async function migrateExcel(buffer, userId, filename = 'EXCEL_IMPORT') {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1); // Assuming first sheet

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        rows.push(row);
    });

    const headers = sheet.getRow(1).values; // Header values (1-based or 0-based depending on exceljs)

    // Step 9: Execution Order starts here

    return await prisma.$transaction(async (tx) => {

        // 1️⃣ Step 4 & 9: Entity Master (Collect all unique entities from headers)
        // Entity columns match pattern "<MM> - <Entity Name>"
        const entitiesInSheet = new Set();
        const monthlyColumns = []; // Store { colIndex, month, entityName }

        headers.forEach((h, index) => {
            if (!h || typeof h !== 'string') return;
            const match = h.match(/^(\d{2})\s*-\s*(.+)$/);
            if (match) {
                const entityName = match[2].trim();
                entitiesInSheet.add(entityName);
                monthlyColumns.push({
                    index,
                    monthNo: parseInt(match[1]),
                    entityName
                });
            }
        });

        logger.info(`Found ${entitiesInSheet.size} unique entities in Excel headers.`);

        for (const entityName of entitiesInSheet) {
            await tx.entityMaster.upsert({
                where: { entity_name: entityName },
                update: {},
                create: { entity_name: entityName }
            });
        }

        const entityLookup = await tx.entityMaster.findMany();
        const entityMap = new Map(entityLookup.map(e => [e.entity_name, e.id]));

        // Process Each Data Row
        let totalRecordsMigrated = 0;

        for (const row of rows) {
            const getVal = (idx) => {
                const cell = row.getCell(idx);
                // Handle complex exceljs cell objects (formulas, dates, etc)
                if (cell.value && typeof cell.value === 'object') {
                    if (cell.value.result !== undefined) return cell.value.result;
                    if (cell.value instanceof Date) return cell.value;
                }
                return cell.value;
            };

            // XLS Header Mapping for Service Master (1️⃣)
            // Note: Indices in row.getCell() are 1-based matching column headers
            const uid = getVal(1); // Row-based, needs precise index mapping
            if (!uid) continue;

            const serviceData = {
                uid: String(uid),
                parent_uid: String(getVal(2) || ''),
                vendor: String(getVal(3) || ''),
                vendor_service: String(getVal(4) || ''),
                service: String(getVal(5) || ''),
                service_description: String(getVal(6) || ''),
                contract: String(getVal(7) || ''),
                service_start_date: getVal(8) ? new Date(getVal(8)) : null,
                service_end_date: getVal(9) ? new Date(getVal(9)) : null,
                renewal_date: getVal(10) ? new Date(getVal(10)) : null,
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

            // 2. Procurement Details (2️⃣) - Clear, then Create
            await tx.procurementDetail.deleteMany({ where: { service_id: service.id } });
            await tx.procurementDetail.create({
                data: {
                    service_id: service.id,
                    entity: String(getVal(19) || ''), // XLS Column 19
                    pr_number: String(getVal(20) || ''),
                    pr_date: getVal(21) ? new Date(getVal(21)) : null,
                    pr_amount: parseFloat(getVal(22)) || 0,
                    currency: String(getVal(23) || 'INR'),
                    po_number: String(getVal(24) || ''),
                    po_date: getVal(25) ? new Date(getVal(25)) : null,
                    po_value: parseFloat(getVal(26)) || 0,
                    common_currency: String(getVal(27) || 'INR'),
                    common_currency_value_inr: parseFloat(getVal(28)) || 0,
                    value_in_lac: (parseFloat(getVal(28)) || 0) / 100000
                }
            });

            // 3. Allocation Basis (3️⃣) - Clear, then Create
            await tx.allocationBasis.deleteMany({ where: { service_id: service.id } });
            await tx.allocationBasis.create({
                data: {
                    service_id: service.id,
                    basis_of_allocation: String(getVal(29) || ''),
                    allocation_basis: String(getVal(30) || ''),
                    total_count: parseInt(getVal(31)) || 0
                }
            });

            // 4. FY Totals (5️⃣) - Upsert to handle unique constraint
            const fyBudget = parseFloat(getVal(32)) || 0;
            const fyActualRaw = parseFloat(getVal(33)) || 0;

            await tx.fYActual.upsert({
                where: {
                    service_id_financial_year: {
                        service_id: service.id,
                        financial_year: 'FY25'
                    }
                },
                update: {
                    fy_budget: fyBudget,
                    fy_actuals: fyActualRaw
                },
                create: {
                    service_id: service.id,
                    financial_year: 'FY25',
                    fy_budget: fyBudget,
                    fy_actuals: fyActualRaw
                }
            });

            // 5. Monthly Entity Actuals (6️⃣) - Clear, then Create
            // We clear only for the months present in this excel to allow partial updates? 
            // Better to clear all for this service to ensure Excel is source of truth.
            await tx.monthlyEntityActual.deleteMany({ where: { service_id: service.id } });

            let rowSum = 0;
            for (const col of monthlyColumns) {
                const amount = parseFloat(getVal(col.index)) || 0;
                if (amount !== 0) {
                    await tx.monthlyEntityActual.create({
                        data: {
                            service_id: service.id,
                            entity_id: entityMap.get(col.entityName),
                            month_no: col.monthNo,
                            amount: amount
                        }
                    });
                    rowSum += amount;
                }
            }

            // Step 8: Post-Migration Validation Check 1
            // We reconcile the row total with the control number
            // Use a small epsilon for float comparison
            if (Math.abs(rowSum - fyActualRaw) > 1.0) {
                logger.warn(`UID ${service.uid}: Reconciliation mismatch. Row Sum (${rowSum}) vs FY Actuals (${fyActualRaw})`);
            }

            totalRecordsMigrated++;
        }

        // Create Import History record
        await tx.importHistory.create({
            data: {
                type: 'MASTER_MIGRATION',
                filename: filename,
                totalRows: rows.length,
                acceptedRows: totalRecordsMigrated,
                rejectedRows: rows.length - totalRecordsMigrated,
                status: 'COMPLETED',
                userId: userId
            }
        });

        return {
            success: true,
            recordsMigrated: totalRecordsMigrated,
            entitiesDetected: entitiesInSheet.size
        };
    });
}

module.exports = {
    migrateExcel
};
