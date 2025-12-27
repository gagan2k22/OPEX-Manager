const exceljs = require('exceljs');
const prisma = require('../prisma');
const logger = require('../utils/logger');

/**
 * BOA Allocation Import Service
 * Handles simplified BOA allocation Excel files with format:
 * Column A: Vendor/Service
 * Column B: Basis of Allocation
 * Column C: Total Count
 * Column D+: Entity names with allocation counts
 */

async function importBOAAllocation(buffer, userId, filename = 'BOA_ALLOCATION_IMPORT') {
    const requestId = `BOA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    logger.info(`[${requestId}] ========== BOA ALLOCATION IMPORT STARTED ==========`);
    logger.info(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
    logger.info(`[${requestId}] User ID: ${userId}`);
    logger.info(`[${requestId}] Filename: ${filename}`);
    logger.info(`[${requestId}] Buffer size: ${buffer.length} bytes`);

    try {
        // STEP 1: Validate buffer
        if (!buffer || buffer.length === 0) {
            throw new Error('Empty or invalid file buffer');
        }
        logger.info(`[${requestId}] ✓ Buffer validation passed`);

        // STEP 2: Load workbook
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(buffer);
        logger.info(`[${requestId}] ✓ Workbook loaded successfully`);

        // STEP 3: Get worksheet
        const sheet = workbook.getWorksheet(1);
        if (!sheet) {
            throw new Error('No worksheet found in Excel file');
        }
        logger.info(`[${requestId}] ✓ Worksheet found: ${sheet.name || 'Sheet1'}`);
        logger.info(`[${requestId}] Worksheet has ${sheet.rowCount} rows`);

        // STEP 4: Parse headers
        const headerRow = sheet.getRow(1);
        const headers = [];
        headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            headers[colNumber] = cell.value ? String(cell.value).trim() : null;
        });

        logger.info(`[${requestId}] ✓ Found ${headers.length} columns in header row`);
        logger.info(`[${requestId}] Headers: ${headers.filter(h => h).join(', ')}`);

        // STEP 5: Validate required columns
        if (!headers[1] || !headers[2] || !headers[3]) {
            throw new Error('Missing required columns. Expected: Column A (Vendor/Service), Column B (Basis), Column C (Total Count)');
        }
        logger.info(`[${requestId}] ✓ Required columns validated`);

        // STEP 6: Identify entity columns
        const entityColumns = [];
        for (let i = 4; i <= headers.length; i++) {
            if (headers[i]) {
                entityColumns.push({
                    index: i,
                    entityName: headers[i]
                });
            }
        }

        if (entityColumns.length === 0) {
            throw new Error('No entity columns found. Expected entity names starting from Column D');
        }
        logger.info(`[${requestId}] ✓ Detected ${entityColumns.length} entity columns: ${entityColumns.map(e => e.entityName).join(', ')}`);

        // STEP 7: Validate database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
            logger.info(`[${requestId}] ✓ Database connection verified`);
        } catch (dbError) {
            logger.error(`[${requestId}] ✗ Database connection failed: ${dbError.message}`);
            throw new Error(`Database connection error: ${dbError.message}`);
        }

        // STEP 8: Pre-create/verify entities
        const entityMap = new Map();
        logger.info(`[${requestId}] Creating/verifying ${entityColumns.length} entities...`);
        
        for (const col of entityColumns) {
            try {
                const entity = await prisma.entityMaster.upsert({
                    where: { entity_name: col.entityName },
                    update: {},
                    create: { entity_name: col.entityName }
                });
                entityMap.set(col.entityName, entity.id);
                logger.debug(`[${requestId}] Entity created/verified: ${col.entityName} → ID: ${entity.id}`);
            } catch (entityError) {
                logger.error(`[${requestId}] Failed to create entity ${col.entityName}: ${entityError.message}`);
                throw new Error(`Entity creation failed for ${col.entityName}: ${entityError.message}`);
            }
        }
        logger.info(`[${requestId}] ✓ All ${entityMap.size} entities created/verified`);

        // STEP 9: Collect data rows
        const rawRows = [];
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            rawRows.push({ row, rowNumber });
        });

        if (rawRows.length === 0) {
            throw new Error('No data rows found in Excel file');
        }
        logger.info(`[${requestId}] ✓ Found ${rawRows.length} data rows to process`);

        // STEP 10: Pre-fetch all services
        logger.info(`[${requestId}] Fetching all services from database...`);
        const allServices = await prisma.serviceMaster.findMany({
            select: {
                id: true,
                uid: true,
                service: true,
                vendor: true
            }
        });

        if (allServices.length === 0) {
            throw new Error('No services found in database. Please import services first before importing BOA allocation.');
        }
        logger.info(`[${requestId}] ✓ Pre-fetched ${allServices.length} services for matching`);

        // STEP 11: Build service lookup maps
        const serviceByUid = new Map();
        const servicesByName = new Map();
        const servicesByVendor = new Map();

        allServices.forEach(service => {
            if (service.uid) serviceByUid.set(service.uid, service);
            if (service.service) {
                const serviceName = service.service.toLowerCase();
                if (!servicesByName.has(serviceName)) {
                    servicesByName.set(serviceName, []);
                }
                servicesByName.get(serviceName).push(service);
            }
            if (service.vendor) {
                const vendorName = service.vendor.toLowerCase();
                if (!servicesByVendor.has(vendorName)) {
                    servicesByVendor.set(vendorName, []);
                }
                servicesByVendor.get(vendorName).push(service);
            }
        });
        logger.info(`[${requestId}] ✓ Service lookup maps built`);

        // STEP 12: Process data rows
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        const BATCH_SIZE = 50;

        logger.info(`[${requestId}] ========== PROCESSING DATA ROWS ==========`);

        for (let batchStart = 0; batchStart < rawRows.length; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, rawRows.length);
            const batch = rawRows.slice(batchStart, batchEnd);
            const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;

            logger.info(`[${requestId}] Processing batch ${batchNum} (rows ${batchStart + 2}-${batchEnd + 1})...`);

            for (const { row, rowNumber } of batch) {
                try {
                    const getVal = (colIndex) => {
                        const cell = row.getCell(colIndex);
                        if (!cell || cell.value === null || cell.value === undefined) return null;
                        if (cell.value && typeof cell.value === 'object') {
                            if (cell.value.result !== undefined) return cell.value.result;
                            if (cell.value.text !== undefined) return cell.value.text;
                        }
                        return cell.value;
                    };

                    // Column A: Vendor/Service
                    const vendorService = getVal(1);
                    if (!vendorService) {
                        logger.warn(`[${requestId}] Row ${rowNumber}: Skipping - no vendor/service identifier`);
                        errorCount++;
                        errors.push({ row: rowNumber, error: 'Missing vendor/service identifier' });
                        continue;
                    }

                    // Column B: Basis of Allocation
                    const basisOfAllocation = getVal(2) || '';
                    
                    // Column C: Total Count
                    const totalCountRaw = getVal(3);
                    const totalCount = totalCountRaw ? parseInt(totalCountRaw) : 0;

                    logger.debug(`[${requestId}] Row ${rowNumber}: ${vendorService}, Basis: ${basisOfAllocation}, Total: ${totalCount}`);

                    // Find matching service
                    const vendorServiceStr = String(vendorService);
                    let service = serviceByUid.get(vendorServiceStr);

                    if (!service) {
                        const searchKey = vendorServiceStr.toLowerCase();
                        const matchingServices = servicesByName.get(searchKey) || servicesByVendor.get(searchKey);
                        if (matchingServices && matchingServices.length > 0) {
                            service = matchingServices[0];
                        }
                    }

                    if (!service) {
                        logger.warn(`[${requestId}] Row ${rowNumber}: Service not found for: ${vendorService}`);
                        errorCount++;
                        errors.push({ row: rowNumber, error: `Service not found: ${vendorService}` });
                        continue;
                    }

                    // Process in transaction
                    await prisma.$transaction(async (tx) => {
                        // Update or create AllocationBasis
                        const existingBasis = await tx.allocationBasis.findFirst({
                            where: { service_id: service.id }
                        });

                        if (existingBasis) {
                            await tx.allocationBasis.update({
                                where: { id: existingBasis.id },
                                data: {
                                    basis_of_allocation: basisOfAllocation,
                                    total_count: totalCount
                                }
                            });
                            logger.debug(`[${requestId}] Row ${rowNumber}: Updated AllocationBasis ID ${existingBasis.id}`);
                        } else {
                            const newBasis = await tx.allocationBasis.create({
                                data: {
                                    service_id: service.id,
                                    basis_of_allocation: basisOfAllocation,
                                    total_count: totalCount
                                }
                            });
                            logger.debug(`[${requestId}] Row ${rowNumber}: Created AllocationBasis ID ${newBasis.id}`);
                        }

                        // Delete existing entity allocations
                        const deleted = await tx.serviceEntityAllocation.deleteMany({
                            where: { service_id: service.id }
                        });
                        logger.debug(`[${requestId}] Row ${rowNumber}: Deleted ${deleted.count} old entity allocations`);

                        // Process entity allocation counts
                        let calculatedTotal = 0;
                        const allocations = [];

                        for (const col of entityColumns) {
                            const count = parseFloat(getVal(col.index)) || 0;
                            if (count > 0) {
                                const entityId = entityMap.get(col.entityName);
                                if (entityId) {
                                    allocations.push({
                                        service_id: service.id,
                                        entity_id: entityId,
                                        count: count
                                    });
                                    calculatedTotal += count;
                                }
                            }
                        }

                        // Create entity allocations
                        if (allocations.length > 0) {
                            await tx.serviceEntityAllocation.createMany({
                                data: allocations
                            });
                            logger.debug(`[${requestId}] Row ${rowNumber}: Created ${allocations.length} entity allocations`);
                        }

                        // Validate total count
                        if (totalCount > 0 && Math.abs(totalCount - calculatedTotal) > 0.01) {
                            logger.warn(`[${requestId}] Row ${rowNumber}: Total mismatch. Excel: ${totalCount}, Calculated: ${calculatedTotal}`);
                            await tx.allocationBasis.updateMany({
                                where: { service_id: service.id },
                                data: { total_count: Math.round(calculatedTotal) }
                            });
                        }
                    }, {
                        timeout: 15000
                    });

                    successCount++;
                    logger.debug(`[${requestId}] Row ${rowNumber}: ✓ Successfully processed ${service.uid}`);

                } catch (rowError) {
                    logger.error(`[${requestId}] Row ${rowNumber}: ✗ Error - ${rowError.message}`);
                    logger.error(`[${requestId}] Row ${rowNumber}: Stack - ${rowError.stack}`);
                    errorCount++;
                    errors.push({ row: rowNumber, error: rowError.message });
                }
            }

            logger.info(`[${requestId}] Batch ${batchNum} complete: ${successCount} success, ${errorCount} errors so far`);
        }

        // STEP 13: Create import history
        logger.info(`[${requestId}] Creating import history record...`);
        const importHistory = await prisma.importHistory.create({
            data: {
                type: 'BOA_ALLOCATION',
                filename: filename,
                totalRows: rawRows.length,
                acceptedRows: successCount,
                rejectedRows: errorCount,
                status: errorCount === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS',
                userId: userId
            }
        });
        logger.info(`[${requestId}] ✓ Import history created: ID ${importHistory.id}`);

        const duration = Date.now() - startTime;
        logger.info(`[${requestId}] ========== BOA ALLOCATION IMPORT COMPLETED ==========`);
        logger.info(`[${requestId}] Duration: ${duration}ms`);
        logger.info(`[${requestId}] Total rows: ${rawRows.length}`);
        logger.info(`[${requestId}] Successful: ${successCount}`);
        logger.info(`[${requestId}] Failed: ${errorCount}`);
        logger.info(`[${requestId}] Entities detected: ${entityColumns.length}`);

        return {
            success: true,
            recordsProcessed: successCount,
            recordsFailed: errorCount,
            entitiesDetected: entityColumns.length,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit to first 10 errors
            requestId: requestId
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`[${requestId}] ========== BOA ALLOCATION IMPORT FAILED ==========`);
        logger.error(`[${requestId}] Duration: ${duration}ms`);
        logger.error(`[${requestId}] Error: ${error.message}`);
        logger.error(`[${requestId}] Stack: ${error.stack}`);
        
        // Re-throw with enhanced error message
        throw new Error(`BOA Import failed [${requestId}]: ${error.message}`);
    }
}


module.exports = {
    importBOAAllocation
};
