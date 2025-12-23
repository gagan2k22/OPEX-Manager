const prisma = require('../prisma');

class ReportsService {
    /**
     * Get dashboard summary metrics
     */
    async getDashboardSummary(fy = 'FY25') {
        const stats = await prisma.fYActual.aggregate({
            where: { financial_year: fy },
            _sum: {
                fy_budget: true,
                fy_actuals: true
            }
        });

        const procStats = await prisma.procurementDetail.aggregate({
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
    async getTowerWiseReport(fy = 'FY25') {
        const services = await prisma.serviceMaster.findMany({
            include: {
                fy_actuals: {
                    where: { financial_year: fy }
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
    async getVendorWiseReport(fy = 'FY25') {
        const services = await prisma.serviceMaster.findMany({
            include: {
                fy_actuals: {
                    where: { financial_year: fy }
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
    async getMonthlyTrend() {
        // Aggregate amount by month from MonthlyEntityActual
        const monthlyData = await prisma.monthlyEntityActual.groupBy({
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

