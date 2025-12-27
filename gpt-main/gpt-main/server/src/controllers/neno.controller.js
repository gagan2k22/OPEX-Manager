const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

const processChat = async (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    try {
        let response = {
            text: "I'm Neno, your OPEX assistant. I can help with 'Budget Summary', 'UID Search', or 'Import Status'.",
            action: null,
            data: null
        };

        // 1. Budget Summary Query (New Schema)
        if (lowerMsg.includes('budget') || lowerMsg.includes('total')) {
            const result = await prisma.fYActual.aggregate({
                where: { financial_year: config.server.defaultFY },
                _sum: {
                    fy_budget: true,
                    fy_actuals: true
                }
            });
            const budget = result._sum.fy_budget || 0;
            const actuals = result._sum.fy_actuals || 0;
            const variance = budget - actuals;
            const fy = config.server.defaultFY;

            response.text = `For ${fy}, the total budget is ${formatINR(budget)}. \n\nDirect Status:\n- Actuals: ${formatINR(actuals)}\n- Variance (Savings): ${formatINR(variance)}`;
        }

        // 2. Service/UID Master Stats
        else if (lowerMsg.includes('service') || lowerMsg.includes('uid') || lowerMsg.includes('how many')) {
            const serviceCount = await prisma.serviceMaster.count();
            const topVendors = await prisma.serviceMaster.groupBy({
                by: ['vendor'],
                _count: true,
                orderBy: { _count: { vendor: 'desc' } },
                take: 5
            });

            let text = `We are currently tracking ${serviceCount} unique services/UIDs. \n\nTop vendors by contract volume:\n`;
            topVendors.forEach(v => {
                text += `- ${v.vendor || 'N/A'}: ${v._count} contracts\n`;
            });
            response.text = text;
        }

        // 3. Import Support
        else if (lowerMsg.includes('import') || lowerMsg.includes('history')) {
            const lastImport = await prisma.auditLog.findFirst({
                where: { action: 'IMPORT_EXCEL' },
                orderBy: { createdAt: 'desc' }
            });

            if (lastImport) {
                const details = JSON.parse(lastImport.newValue);
                response.text = `The most recent master import was completed on ${new Date(lastImport.createdAt).toLocaleDateString()}. It successfully migrated ${details.stats.recordsMigrated} records.`;
            } else {
                response.text = "I don't see any record of recent Excel migrations. You can perform one on the Tracker page.";
            }
        }

        // 4. UI Customization (Theme) - Keeping this as it's a Neno signature
        else if (lowerMsg.includes('color') || lowerMsg.includes('theme') || lowerMsg.includes('dark')) {
            if (lowerMsg.includes('dark')) {
                response.text = "Switching to dark mode for you!";
                response.action = { type: 'THEME_UPDATE', payload: { backgroundColor: '#111827', primaryColor: '#3B82F6' } };
            } else {
                response.text = "I can apply visual themes. Try asking for 'dark mode' or 'reset theme'.";
            }
        }

        // Help
        else if (lowerMsg.includes('help')) {
            response.text = `I am Neno. I can provide ${config.server.defaultFY} budget summaries, service counts, vendor distribution, and check migration logs.`;
        }

        res.json(response);
    } catch (error) {
        logger.error('Neno Chat Error: %s', error.stack);
        res.status(500).json({ text: "Sorry, I encountered an error querying the tracking system." });
    }
};

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

module.exports = { processChat };
