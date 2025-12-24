const prisma = require('../prisma');

class ReportsService {
    /**
     * Get dashboard summary metrics
     */
    async getDashboardSummary(fy = 'FY25', entityName = null) {
        const where = { financial_year: fy };
        if (entityName && entityName !== 'all') {
            where.po_entity = entityName;
        }

        const stats = await prisma.fYActual.aggregate({
            where,
            _sum: {
                fy_budget: true,
                fy_actuals: true
            }
        });

        // For committed spend, we look at PO Values
        // This is tricky for entity-specific as POs are associated with services
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

        return {
            budget,
            actuals,
            committed,
            variance: budget - actuals,
            utilization: budget > 0 ? (actuals / budget) * 100 : 0
        };
    }

    /**
     * Get Tower-wise budget vs actuals
     */
    async getTowerWiseReport(fy = 'FY25', entityName = null) {
        const where = {
            fy_actuals: {
                some: {
                    financial_year: fy,
                    ...(entityName && entityName !== 'all' ? { po_entity: entityName } : {})
                }
            }
        };

        const services = await prisma.serviceMaster.findMany({
            where,
            include: {
                fy_actuals: {
                    where: {
                        financial_year: fy,
                        ...(entityName && entityName !== 'all' ? { po_entity: entityName } : {})
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
    async getVendorWiseReport(fy = 'FY25', entityName = null) {
        const where = {
            fy_actuals: {
                some: {
                    financial_year: fy,
                    ...(entityName && entityName !== 'all' ? { po_entity: entityName } : {})
                }
            }
        };

        const services = await prisma.serviceMaster.findMany({
            where,
            include: {
                fy_actuals: {
                    where: {
                        financial_year: fy,
                        ...(entityName && entityName !== 'all' ? { po_entity: entityName } : {})
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
        let serviceIds = null;
        if (entityName && entityName !== 'all') {
            const services = await prisma.fYActual.findMany({
                where: {
                    financial_year: 'FY25',
                    po_entity: entityName
                },
                select: { service_id: true }
            });
            serviceIds = services.map(s => s.service_id);
        }

        const where = serviceIds ? { service_id: { in: serviceIds } } : {};

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
