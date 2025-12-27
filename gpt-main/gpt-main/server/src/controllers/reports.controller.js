const reportsService = require('../services/reports.service');
const config = require('../config');

const getDashboardStats = async (req, res) => {
    try {
        const { entityId } = req.query;
        const fy = config.server.defaultFY;
        const summary = await reportsService.getDashboardSummary(fy, entityId);
        const towerWise = await reportsService.getTowerWiseReport(fy, entityId);
        const vendorWise = await reportsService.getVendorWiseReport(fy, entityId);
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
