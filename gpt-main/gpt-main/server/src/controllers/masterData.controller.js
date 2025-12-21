/**
 * Master Data Controller
 * Managed with caching for performance optimization
 */

const prisma = require('../prisma');
const cache = require('../utils/cache');
const { NotFoundError } = require('../middleware/errorHandler');

// Generic helper to get data with cache
const getWithCache = async (key, fetchFn, ttl = 3600) => {
    const cached = await cache.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    await cache.set(key, data, ttl);
    return data;
};

// Generic helper to clear related caches
// When modifying 'Tower', we might want to clear 'towers' list and complex objects relying on it
const invalidateCache = async (pattern) => {
    // Simple implementation: clear specific keys known.
    // Real implementation might need pattern matching or tags if using Redis 
    await cache.del(pattern);
};

// ==========================================
// Towers
// ==========================================

const getTowers = async (req, res) => {
    const towers = await getWithCache('towers:all', () =>
        prisma.tower.findMany({
            include: { budget_heads: true },
            orderBy: { name: 'asc' }
        })
    );
    res.json(towers);
};

const createTower = async (req, res) => {
    const { name } = req.body;
    const tower = await prisma.tower.create({ data: { name } });
    await invalidateCache('towers:all');
    res.status(201).json(tower);
};

const updateTower = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const tower = await prisma.tower.update({
        where: { id: parseInt(id) },
        data: { name }
    });

    await invalidateCache('towers:all');
    res.json(tower);
};

const deleteTower = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.tower.delete({ where: { id: parseInt(id) } });
    } catch (err) {
        if (err.code === 'P2025') throw new NotFoundError('Tower');
        throw err;
    }

    await invalidateCache('towers:all');
    res.json({ message: 'Tower deleted successfully' });
};

// ==========================================
// Budget Heads
// ==========================================

const getBudgetHeads = async (req, res) => {
    const budgetHeads = await getWithCache('budgetHeads:all', () =>
        prisma.budgetHead.findMany({
            include: { tower: true },
            orderBy: { name: 'asc' }
        })
    );
    res.json(budgetHeads);
};

const createBudgetHead = async (req, res) => {
    const { name, tower_id } = req.body;
    const budgetHead = await prisma.budgetHead.create({
        data: { name, tower_id: parseInt(tower_id) }
    });

    await Promise.all([
        invalidateCache('budgetHeads:all'),
        invalidateCache('towers:all') // Towers include budget heads
    ]);

    res.status(201).json(budgetHead);
};

const updateBudgetHead = async (req, res) => {
    const { id } = req.params;
    const { name, tower_id } = req.body;

    const budgetHead = await prisma.budgetHead.update({
        where: { id: parseInt(id) },
        data: { name, tower_id: parseInt(tower_id) }
    });

    await Promise.all([
        invalidateCache('budgetHeads:all'),
        invalidateCache('towers:all')
    ]);

    res.json(budgetHead);
};

const deleteBudgetHead = async (req, res) => {
    const { id } = req.params;
    await prisma.budgetHead.delete({ where: { id: parseInt(id) } });

    await Promise.all([
        invalidateCache('budgetHeads:all'),
        invalidateCache('towers:all')
    ]);

    res.json({ message: 'Budget Head deleted successfully' });
};

// ==========================================
// Vendors
// ==========================================

const getVendors = async (req, res) => {
    const vendors = await getWithCache('vendors:all', () =>
        prisma.vendor.findMany({ orderBy: { name: 'asc' } })
    );
    res.json(vendors);
};

const createVendor = async (req, res) => {
    const { name, gst_number, contact_person } = req.body;
    const vendor = await prisma.vendor.create({
        data: { name, gst_number, contact_person }
    });
    await invalidateCache('vendors:all');
    res.status(201).json(vendor);
};

const updateVendor = async (req, res) => {
    const { id } = req.params;
    const { name, gst_number, contact_person } = req.body;
    const vendor = await prisma.vendor.update({
        where: { id: parseInt(id) },
        data: { name, gst_number, contact_person }
    });
    await invalidateCache('vendors:all');
    res.json(vendor);
};

const deleteVendor = async (req, res) => {
    const { id } = req.params;
    await prisma.vendor.delete({ where: { id: parseInt(id) } });
    await invalidateCache('vendors:all');
    res.json({ message: 'Vendor deleted successfully' });
};

// ==========================================
// Cost Centres
// ==========================================

const getCostCentres = async (req, res) => {
    const costCentres = await getWithCache('costCentres:all', () =>
        prisma.costCentre.findMany({ orderBy: { code: 'asc' } })
    );
    res.json(costCentres);
};

const createCostCentre = async (req, res) => {
    const { code, description } = req.body;
    const costCentre = await prisma.costCentre.create({
        data: { code, description }
    });
    await invalidateCache('costCentres:all');
    res.status(201).json(costCentre);
};

const updateCostCentre = async (req, res) => {
    const { id } = req.params;
    const { code, description } = req.body;
    const costCentre = await prisma.costCentre.update({
        where: { id: parseInt(id) },
        data: { code, description }
    });
    await invalidateCache('costCentres:all');
    res.json(costCentre);
};

const deleteCostCentre = async (req, res) => {
    const { id } = req.params;
    await prisma.costCentre.delete({ where: { id: parseInt(id) } });
    await invalidateCache('costCentres:all');
    res.json({ message: 'Cost Centre deleted successfully' });
};

// ==========================================
// Other Entities (Simple Implementations)
// ==========================================

// Helper for simple entity CRUD
const createEntityHandlers = (modelName, cacheKey) => ({
    getAll: async (req, res) => {
        const data = await getWithCache(cacheKey, () =>
            prisma[modelName].findMany({ orderBy: { name: 'asc' } })
        );
        res.json(data);
    },
    create: async (req, res) => {
        const { name } = req.body;
        const item = await prisma[modelName].create({ data: { name } });
        await invalidateCache(cacheKey);
        res.status(201).json(item);
    },
    update: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        const item = await prisma[modelName].update({
            where: { id: parseInt(id) },
            data: { name }
        });
        await invalidateCache(cacheKey);
        res.json(item);
    },
    delete: async (req, res) => {
        const { id } = req.params;
        await prisma[modelName].delete({ where: { id: parseInt(id) } });
        await invalidateCache(cacheKey);
        res.json({ message: 'Deleted successfully' });
    }
});

// Create handlers for simple entities
const poHandlers = createEntityHandlers('pOEntity', 'poEntities:all');
const serviceHandlers = createEntityHandlers('serviceType', 'serviceTypes:all');
const allocHandlers = createEntityHandlers('allocationBasis', 'allocBases:all');

module.exports = {
    getTowers, createTower, updateTower, deleteTower,
    getBudgetHeads, createBudgetHead, updateBudgetHead, deleteBudgetHead,
    getVendors, createVendor, updateVendor, deleteVendor,
    getCostCentres, createCostCentre, updateCostCentre, deleteCostCentre,

    getPOEntities: poHandlers.getAll,
    createPOEntity: poHandlers.create,
    updatePOEntity: poHandlers.update,
    deletePOEntity: poHandlers.delete,

    getServiceTypes: serviceHandlers.getAll,
    createServiceType: serviceHandlers.create,
    updateServiceType: serviceHandlers.update,
    deleteServiceType: serviceHandlers.delete,

    getAllocationBases: allocHandlers.getAll,
    createAllocationBasis: allocHandlers.create,
    updateAllocationBasis: allocHandlers.update,
    deleteAllocationBasis: allocHandlers.delete
};
