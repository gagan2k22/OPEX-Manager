const prisma = require('../prisma');
const config = require('../config');
const cacheService = require('../utils/cache');

class ReportsService {
    /**
     * Get dashboard summary metrics
     */
    async getDashboardSummary(fy = config.server.defaultFY, entityName = null) {
        const cacheKey = `dashboard:summary:${fy}:${entityName || 'all'}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const where = { financial_year: fy };
        if (entityName && entityName !== 'all') {
            where.service = {
                procurement_details: {
                    some: {
                        entity: entityName
                    }
                }
            };
        }

        const stats = await prisma.fYActual.aggregate({
            where,
            _sum: {
                fy_budget: true,
                fy_actuals: true
            }
        });

        // For committed spend, we look at PO Values
        const procWhere = entityName && entityName !== 'all' ? { entity: entityName } : {};
        const procStats = await prisma.procurementDetail.aggregate({
            where: procWhere,
            _sum: {
                po_value: true
            }
        });

        const budget = stats._sum.fy_budget || 0;
        const actuals = stats._sum.fy_actuals || 0;
        const committed = procStats._sum.po_value || 0;

        const result = {
            budget,
            actuals,
            committed,
            variance: budget - actuals,
            utilization: budget > 0 ? (actuals / budget) * 100 : 0
        };

        await cacheService.set(cacheKey, result, 600); // 10 mins

        return result;
    }

    /**
     * Get Tower-wise budget vs actuals
     */
    async getTowerWiseReport(fy = config.server.defaultFY, entityName = null) {
        const where = {
            fy_actuals: {
                some: {
                    financial_year: fy
                }
            }
        };

        if (entityName && entityName !== 'all') {
            where.procurement_details = {
                some: {
                    entity: entityName
                }
            };
        }

        const services = await prisma.serviceMaster.findMany({
            where,
            include: {
                fy_actuals: {
                    where: {
                        financial_year: fy
                    }
                }
            }
        });

        const towerMap = {};

        services.forEach(s => {
            const tower = s.tower || 'Unassigned';
            const fyData = s.fy_actuals[0] || { fy_budget: 0, fy_actuals: 0 };

            if (!towerMap[tower]) {
                towerMap[tower] = { budget: 0, actuals: 0 };
            }
            towerMap[tower].budget += fyData.fy_budget;
            towerMap[tower].actuals += fyData.fy_actuals;
        });

        return Object.entries(towerMap).map(([name, data]) => ({
            name,
            budget: data.budget,
            actuals: data.actuals,
            variance: data.budget - data.actuals
        }));
    }

    /**
     * Get Vendor-wise spend
     */
    async getVendorWiseReport(fy = config.server.defaultFY, entityName = null) {
        const where = {
            fy_actuals: {
                some: {
                    financial_year: fy
                }
            }
        };

        if (entityName && entityName !== 'all') {
            where.procurement_details = {
                some: {
                    entity: entityName
                }
            };
        }

        const services = await prisma.serviceMaster.findMany({
            where,
            include: {
                fy_actuals: {
                    where: {
                        financial_year: fy
                    }
                }
            }
        });

        const vendorMap = {};

        services.forEach(s => {
            const vendor = s.vendor || 'Unknown Vendor';
            const fyData = s.fy_actuals[0] || { fy_actuals: 0 };

            if (!vendorMap[vendor]) {
                vendorMap[vendor] = 0;
            }
            vendorMap[vendor] += fyData.fy_actuals;
        });

        const data = Object.entries(vendorMap).map(([name, spend]) => ({
            name,
            spend
        }));

        return data.sort((a, b) => b.spend - a.spend).slice(0, 10);
    }

    /**
     * Get Monthly Trend
     */
    async getMonthlyTrend(entityName = null) {
        let serviceIds = undefined;
        if (entityName && entityName !== 'all') {
            const services = await prisma.procurementDetail.findMany({
                where: {
                    entity: entityName
                },
                select: { service_id: true }
            });
            serviceIds = services.map(s => s.service_id);
        }

        const where = serviceIds ? { service_id: { in: serviceIds } } : {};

        // If filtering by entity, we should also filter the monthly actuals by that entity in MonthlyEntityActual
        if (entityName && entityName !== 'all') {
            const entity = await prisma.entityMaster.findUnique({ where: { entity_name: entityName } });
            if (entity) {
                where.entity_id = entity.id;
            }
        }

        const monthlyData = await prisma.monthlyEntityActual.groupBy({
            where,
            by: ['month_no'],
            _sum: {
                amount: true
            },
            orderBy: {
                month_no: 'asc'
            }
        });

        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

        return monthlyData.map(d => ({
            month: months[d.month_no - 1] || `Month ${d.month_no}`,
            amount: d._sum.amount || 0
        }));
    }
}

module.exports = new ReportsService();

