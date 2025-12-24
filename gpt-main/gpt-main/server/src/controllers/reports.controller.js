const reportsService = require('../services/reports.service');

const getDashboardStats = async (req, res) => {
    try {
        const { entityId } = req.query;
        const summary = await reportsService.getDashboardSummary('FY25', entityId);
        const towerWise = await reportsService.getTowerWiseReport('FY25', entityId);
        const vendorWise = await reportsService.getVendorWiseReport('FY25', entityId);
        const monthlyTrend = await reportsService.getMonthlyTrend(entityId);

        res.json({
            summary,
            towerWise,
            vendorWise,
            monthlyTrend
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
