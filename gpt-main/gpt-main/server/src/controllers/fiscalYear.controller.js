const prisma = require('../prisma');

const getFiscalYears = async (req, res) => {
    try {
        const fiscalYears = await prisma.fiscalYear.findMany({
            orderBy: { name: 'asc' }
        });

        // Map to format expected by frontend (which expects 'label')
        const formattedYears = fiscalYears.map(fy => ({
            ...fy,
            label: fy.name,
            year: parseInt(fy.name.replace(/\D/g, '')) + 2000 // Approximate year from FYxx
        }));

        res.json(formattedYears);
    } catch (error) {
        console.error('Error fetching fiscal years:', error);
        res.status(500).json({ message: error.message });
    }
};

const toggleFiscalYearStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const fiscalYear = await prisma.fiscalYear.update({
            where: { id: parseInt(id) },
            data: { isActive: is_active } // Schema uses isActive, frontend sends is_active
        });

        res.json(fiscalYear);
    } catch (error) {
        console.error('Error toggling fiscal year:', error);
        res.status(500).json({ message: error.message });
    }
};

const createFiscalYear = async (req, res) => {
    try {
        const { label, start_date, end_date, is_active } = req.body;

        const fiscalYear = await prisma.fiscalYear.create({
            data: {
                name: label, // Map label to name
                startDate: new Date(start_date),
                endDate: new Date(end_date),
                isActive: is_active !== undefined ? is_active : true
            }
        });

        res.status(201).json(fiscalYear);
    } catch (error) {
        console.error('Error creating fiscal year:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFiscalYears,
    toggleFiscalYearStatus,
    createFiscalYear
};
