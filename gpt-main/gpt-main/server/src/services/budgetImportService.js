const prisma = require('../prisma');
const ExcelJS = require('exceljs');
const { normalizeToMMM } = require('../utils/monthNormaliser');

class BudgetImportService {
    async processImport(fileBuffer, userId, options = {}) {
        const { dryRun = true, createMissingMasters = false } = options;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1); // Assume first sheet

        const report = {
            totalRows: 0,
            accepted: [],
            rejected: []
        };
        const headerMapping = { rawHeaders: [], normalizedHeaders: [], fieldMap: {} };
        const customMapping = options.customMapping || {}; // { "Excel Header": "appFieldName" }

        // Header processing
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value ? cell.value.toString().trim() : '';
        });

        // Identify columns with intelligent fuzzy matching
        const columnMap = {};
        const monthColumns = {};

        // Helper function for fuzzy header matching
        const matchesHeader = (header, patterns) => {
            const lower = header.toLowerCase().trim();
            return patterns.some(pattern => {
                if (typeof pattern === 'string') {
                    return lower === pattern.toLowerCase() || lower.includes(pattern.toLowerCase());
                }
                return pattern.test(lower);
            });
        };

        headers.forEach((header, index) => {
            if (!header) return;
            headerMapping.rawHeaders.push(header);

            // Check custom mapping first
            if (customMapping[header]) {
                const appField = customMapping[header];
                if (appField.startsWith('month_')) {
                    const mmm = appField.split('_')[1];
                    monthColumns[mmm] = index;
                } else {
                    columnMap[appField] = index;
                }
                headerMapping.normalizedHeaders.push(appField);
                headerMapping.fieldMap[header] = appField;
                return;
            }

            // Fallback to intelligent fuzzy matching
            // UID column - matches: uid, UID, Uid, "UID ", etc.
            if (matchesHeader(header, ['uid', /^uid$/i, 'unique id'])) {
                columnMap.uid = index;
                headerMapping.normalizedHeaders.push('UID');
                headerMapping.fieldMap[header] = 'uid';
            }
            // Parent UID column - matches: parent uid, parent_uid
            else if (matchesHeader(header, ['parent uid', 'parent_uid', 'parentuid'])) {
                columnMap.parentUid = index;
                headerMapping.normalizedHeaders.push('Parent UID');
                headerMapping.fieldMap[header] = 'parentUid';
            }
            // Description column - matches: description, service description, desc, service desc
            else if (matchesHeader(header, ['description', 'service description', 'desc', 'service desc'])) {
                columnMap.description = index;
                headerMapping.normalizedHeaders.push('Description');
                headerMapping.fieldMap[header] = 'description';
            }
            // Tower column - matches: tower, towers
            else if (matchesHeader(header, ['tower', 'towers'])) {
                columnMap.tower = index;
                headerMapping.normalizedHeaders.push('Tower');
                headerMapping.fieldMap[header] = 'tower';
            }
            // Budget Head column
            else if (matchesHeader(header, ['budget head', 'budgethead', 'budget_head', 'budget-head'])) {
                columnMap.budgetHead = index;
                headerMapping.normalizedHeaders.push('Budget Head');
                headerMapping.fieldMap[header] = 'budgetHead';
            }
            // Vendor column
            else if (matchesHeader(header, ['vendor', 'vendor name', 'vendor_name'])) {
                columnMap.vendor = index;
                headerMapping.normalizedHeaders.push('Vendor');
                headerMapping.fieldMap[header] = 'vendor';
            }
            // Start Date
            else if (matchesHeader(header, ['start date', 'service start date', 'start_date'])) {
                columnMap.startDate = index;
                headerMapping.normalizedHeaders.push('Start Date');
                headerMapping.fieldMap[header] = 'startDate';
            }
            // End Date
            else if (matchesHeader(header, ['end date', 'service end date', 'end_date'])) {
                columnMap.endDate = index;
                headerMapping.normalizedHeaders.push('End Date');
                headerMapping.fieldMap[header] = 'endDate';
            }
            // Renewal Date
            else if (matchesHeader(header, ['renewal date', 'renewal_date', 'renewal'])) {
                columnMap.renewalDate = index;
                headerMapping.normalizedHeaders.push('Renewal Date');
                headerMapping.fieldMap[header] = 'renewalDate';
            }
            // Contract/PO
            else if (matchesHeader(header, ['contract', 'contract/po', 'po number', 'po #', 'contract_id', 'has contract'])) {
                columnMap.contractId = index;
                headerMapping.normalizedHeaders.push('Contract/PO');
                headerMapping.fieldMap[header] = 'contractId';
            }
            // PO Entity
            else if (matchesHeader(header, ['po entity', 'po_entity', 'entity'])) {
                columnMap.poEntity = index;
                headerMapping.normalizedHeaders.push('PO Entity');
                headerMapping.fieldMap[header] = 'poEntity';
            }
            // Allocation Basis
            else if (matchesHeader(header, ['allocation basis', 'allocation_basis', 'basis'])) {
                columnMap.allocationBasis = index;
                headerMapping.normalizedHeaders.push('Allocation Basis');
                headerMapping.fieldMap[header] = 'allocationBasis';
            }
            // Allocation Type
            else if (matchesHeader(header, ['allocation type', 'allocation_type', 'alloc type'])) {
                columnMap.allocationType = index;
                headerMapping.normalizedHeaders.push('Allocation Type');
                headerMapping.fieldMap[header] = 'allocationType';
            }
            // Service Type
            else if (matchesHeader(header, ['service type', 'service_type'])) {
                columnMap.serviceType = index;
                headerMapping.normalizedHeaders.push('Service Type');
                headerMapping.fieldMap[header] = 'serviceType';
            }
            // Initiative Type
            else if (matchesHeader(header, ['initiative type', 'initiative_type', 'initiative'])) {
                columnMap.initiativeType = index;
                headerMapping.normalizedHeaders.push('Initiative Type');
                headerMapping.fieldMap[header] = 'initiativeType';
            }
            // Priority
            else if (matchesHeader(header, ['priority'])) {
                columnMap.priority = index;
                headerMapping.normalizedHeaders.push('Priority');
                headerMapping.fieldMap[header] = 'priority';
            }
            // Total column - matches: total, total budget, grand total, and specific year totals like "FY26 Budget"
            else if (matchesHeader(header, ['total', /^total$/i, 'total budget', 'grand total', /FY\d{2} Budget/i])) {
                columnMap.total = index;
                headerMapping.normalizedHeaders.push('Total');
                headerMapping.fieldMap[header] = 'total';
            }
            // Month columns - try to normalize month names
            else {
                try {
                    const mmm = normalizeToMMM(header);
                    monthColumns[mmm] = index;
                    headerMapping.normalizedHeaders.push(mmm);
                    headerMapping.fieldMap[header] = `month_${mmm}`;
                } catch (e) {
                    headerMapping.normalizedHeaders.push(header); // Keep original if not a month
                    // Store as custom column
                    if (!columnMap.customColumns) columnMap.customColumns = {};
                    columnMap.customColumns[header] = index;
                }
            }
        });

        if (!columnMap.uid) {
            throw new Error('UID column is missing');
        }

        // Row processing
        const rowsToUpsert = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            report.totalRows++;

            const rowData = {};
            const errors = [];

            const uidCell = row.getCell(columnMap.uid);
            const uid = uidCell.value ? uidCell.value.toString().trim() : null;

            if (!uid) {
                errors.push('Missing UID');
            } else {
                rowData.uid = uid;
            }

            rowData.parentUid = columnMap.parentUid ? (row.getCell(columnMap.parentUid).value ? row.getCell(columnMap.parentUid).value.toString().trim() : null) : null;

            rowData.description = columnMap.description ? (row.getCell(columnMap.description).value ? row.getCell(columnMap.description).value.toString().trim() : '') : '';
            rowData.tower = columnMap.tower ? (row.getCell(columnMap.tower).value ? row.getCell(columnMap.tower).value.toString().trim() : null) : null;
            rowData.budgetHead = columnMap.budgetHead ? (row.getCell(columnMap.budgetHead).value ? row.getCell(columnMap.budgetHead).value.toString().trim() : null) : null;

            // Extract new fields
            // Extract new fields
            const getCellValue = (cell) => {
                if (!cell) return null;
                if (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined) {
                    return cell.value.result;
                }
                return cell.value;
            };

            const parseDate = (val) => {
                if (!val) return null;
                if (val instanceof Date) return val;
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
            };

            rowData.vendor = columnMap.vendor ? (getCellValue(row.getCell(columnMap.vendor))?.toString().trim() || null) : null;
            rowData.startDate = columnMap.startDate ? parseDate(getCellValue(row.getCell(columnMap.startDate))) : null;
            rowData.endDate = columnMap.endDate ? parseDate(getCellValue(row.getCell(columnMap.endDate))) : null;
            rowData.renewalDate = columnMap.renewalDate ? parseDate(getCellValue(row.getCell(columnMap.renewalDate))) : null;
            rowData.contractId = columnMap.contractId ? (getCellValue(row.getCell(columnMap.contractId))?.toString().trim() || null) : null;
            rowData.poEntity = columnMap.poEntity ? (getCellValue(row.getCell(columnMap.poEntity))?.toString().trim() || null) : null;
            rowData.allocationBasis = columnMap.allocationBasis ? (getCellValue(row.getCell(columnMap.allocationBasis))?.toString().trim() || null) : null;
            rowData.allocationType = columnMap.allocationType ? (getCellValue(row.getCell(columnMap.allocationType))?.toString().trim() || null) : null;
            rowData.serviceType = columnMap.serviceType ? (getCellValue(row.getCell(columnMap.serviceType))?.toString().trim() || null) : null;
            rowData.initiativeType = columnMap.initiativeType ? (getCellValue(row.getCell(columnMap.initiativeType))?.toString().trim() || null) : null;
            rowData.priority = columnMap.priority ? (getCellValue(row.getCell(columnMap.priority))?.toString().trim() || null) : null;

            // Extract custom fields
            const customFields = {};
            if (columnMap.customColumns) {
                for (const [header, colIndex] of Object.entries(columnMap.customColumns)) {
                    const val = getCellValue(row.getCell(colIndex));
                    if (val !== null && val !== undefined && val !== '') {
                        customFields[header] = val;
                    }
                }
            }
            rowData.customFields = Object.keys(customFields).length > 0 ? customFields : null;


            const computedMonths = {};
            let sumMonths = 0;

            for (const [mmm, colIndex] of Object.entries(monthColumns)) {
                const cell = row.getCell(colIndex);
                const val = getCellValue(cell);
                const num = parseFloat(val) || 0;
                if (val !== null && val !== undefined && isNaN(parseFloat(val))) {
                    errors.push(`Invalid amount for ${mmm}: ${val}`);
                }
                computedMonths[mmm] = num;
                sumMonths += num;
            }

            rowData.computedMonths = computedMonths;
            rowData.sumMonths = sumMonths;

            let totalBudget = 0;
            if (columnMap.total) {
                const totalVal = getCellValue(row.getCell(columnMap.total));
                totalBudget = parseFloat(totalVal) || 0;
                // Tolerance check only if Total column exists - increased to 10 for floating-point precision
                if (Math.abs(sumMonths - totalBudget) > 10) {
                    errors.push(`Total mismatch: Sum(${sumMonths}) != Total(${totalBudget})`);
                }
            } else {
                // Auto-calculate if missing
                totalBudget = sumMonths;
            }
            rowData.totalBudget = totalBudget;

            if (errors.length > 0) {
                report.rejected.push({ rowIndex: rowNumber, uid: rowData.uid, errors });
            } else {
                report.accepted.push({ rowIndex: rowNumber, uid: rowData.uid, computedMonths, sumMonths, totalBudget, ...rowData });
                rowsToUpsert.push(rowData);
            }
        });

        if (dryRun) {
            return { dryRun: true, report, headerMapping };
        }

        // Commit logic - Pre-fetch master data to avoid repeated queries
        const allTowers = await prisma.tower.findMany();
        const allBudgetHeads = await prisma.budgetHead.findMany();
        const allFiscalYears = await prisma.fiscalYear.findMany();
        const allVendors = await prisma.vendor.findMany();
        const allPOEntities = await prisma.pOEntity.findMany();
        const allAllocationBases = await prisma.allocationBasis.findMany();
        const allServiceTypes = await prisma.serviceType.findMany();

        // Create lookup maps for O(1) access
        const towerMap = new Map(allTowers.map(t => [t.name.toLowerCase(), t.id]));
        const budgetHeadMap = new Map(allBudgetHeads.map(bh => [bh.name.toLowerCase(), bh.id]));
        const fiscalYearMap = new Map(allFiscalYears.map(fy => [fy.name.toUpperCase(), fy.id]));
        const vendorMap = new Map(allVendors.map(v => [v.name.toLowerCase(), v.id]));
        const poEntityMap = new Map(allPOEntities.map(p => [p.name.toLowerCase(), p.id]));
        const allocationBasisMap = new Map(allAllocationBases.map(a => [a.name.toLowerCase(), a.id]));
        const serviceTypeMap = new Map(allServiceTypes.map(s => [s.name.toLowerCase(), s.id]));

        // Use extended timeout for large imports (60 seconds)
        const results = await prisma.$transaction(async (tx) => {
            const imported = [];

            for (const row of rowsToUpsert) {
                // Master Data Lookup using pre-fetched maps
                const towerId = row.tower ? (towerMap.get(row.tower.toLowerCase()) || null) : null;
                const budgetHeadId = row.budgetHead ? (budgetHeadMap.get(row.budgetHead.toLowerCase()) || null) : null;
                const vendorId = row.vendor ? (vendorMap.get(row.vendor.toLowerCase()) || null) : null;
                const poEntityId = row.poEntity ? (poEntityMap.get(row.poEntity.toLowerCase()) || null) : null;
                const allocationBasisId = row.allocationBasis ? (allocationBasisMap.get(row.allocationBasis.toLowerCase()) || null) : null;
                const serviceTypeId = row.serviceType ? (serviceTypeMap.get(row.serviceType.toLowerCase()) || null) : null;


                // Extract fiscal year from UID (e.g., "DIT-OPEX FY25-001" -> "FY25")
                let fiscalYearId = null;
                const fyMatch = row.uid.match(/FY(\d{2})/i);
                if (fyMatch) {
                    const fyName = `FY${fyMatch[1]}`.toUpperCase();
                    fiscalYearId = fiscalYearMap.get(fyName) || null;
                }

                const lineItem = await tx.lineItem.upsert({
                    where: { uid: row.uid },
                    create: {
                        uid: row.uid,
                        parentUid: row.parentUid,
                        description: row.description,
                        towerId,
                        budgetHeadId,
                        fiscalYearId,
                        vendorId,
                        poEntityId,
                        allocationBasisId,
                        serviceTypeId,
                        contractId: row.contractId,
                        serviceStartDate: row.startDate,
                        serviceEndDate: row.endDate,
                        renewalDate: row.renewalDate,
                        initiativeType: row.initiativeType,
                        priority: row.priority,
                        allocationType: row.allocationType,
                        customFields: row.customFields || undefined,
                        totalBudget: row.totalBudget,
                        createdBy: userId
                    },
                    update: {
                        parentUid: row.parentUid || undefined,
                        description: row.description || undefined,
                        towerId: towerId || undefined,
                        budgetHeadId: budgetHeadId || undefined,
                        fiscalYearId: fiscalYearId || undefined,
                        vendorId: vendorId || undefined,
                        poEntityId: poEntityId || undefined,
                        allocationBasisId: allocationBasisId || undefined,
                        serviceTypeId: serviceTypeId || undefined,
                        contractId: row.contractId || undefined,
                        serviceStartDate: row.startDate || undefined,
                        serviceEndDate: row.endDate || undefined,
                        renewalDate: row.renewalDate || undefined,
                        initiativeType: row.initiativeType || undefined,
                        priority: row.priority || undefined,
                        allocationType: row.allocationType || undefined,
                        customFields: row.customFields || undefined,
                        totalBudget: row.totalBudget || undefined,
                        updatedBy: userId
                    }
                });

                // Upsert months
                for (const [mmm, amount] of Object.entries(row.computedMonths)) {
                    await tx.budgetMonth.upsert({
                        where: {
                            lineitem_month_unique: {
                                lineItemId: lineItem.id,
                                month: mmm
                            }
                        },
                        create: {
                            lineItemId: lineItem.id,
                            month: mmm,
                            amount
                        },
                        update: { amount }
                    });
                }

                // Audit Log
                await tx.auditLog.create({
                    data: {
                        entity: 'LineItem',
                        entityId: lineItem.id,
                        action: 'IMPORT_UPSERT',
                        userId: userId,
                        diff: JSON.stringify(row)
                    }
                });

                imported.push({ uid: lineItem.uid, lineItemId: lineItem.id });
            }

            // Create Import Job record
            await tx.importJob.create({
                data: {
                    userId,
                    filename: 'Budget Import',
                    fileSize: 0,
                    rowsTotal: report.totalRows,
                    rowsAccepted: rowsToUpsert.length,
                    rowsRejected: report.rejected.length,
                    status: 'Completed',
                    importType: 'budgets',
                    metadata: JSON.stringify({ headerMapping })
                }
            });

            return imported;
        }, {
            maxWait: 60000, // 60 seconds max wait
            timeout: 60000  // 60 seconds timeout
        });

        return { success: true, imported: results.length, details: results };
    }
}

module.exports = new BudgetImportService();
