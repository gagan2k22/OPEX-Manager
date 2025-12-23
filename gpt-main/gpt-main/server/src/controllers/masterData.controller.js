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

const invalidateCache = async (pattern) => {
    await cache.del(pattern);
};

// ==========================================
// 4️⃣ Entity Master (Receiving Units)
// ==========================================

const getEntities = async (req, res) => {
    const entities = await getWithCache('entities:all', () =>
        prisma.entityMaster.findMany({ orderBy: { entity_name: 'asc' } })
    );
    res.json(entities);
};

const createEntity = async (req, res) => {
    const { name } = req.body;
    const entity = await prisma.entityMaster.create({
        data: { entity_name: name }
    });
    await invalidateCache('entities:all');
    res.status(201).json(entity);
};

// ==========================================
// 1️⃣ Service Master (UIDs / Contracts)
// ==========================================

const getServices = async (req, res) => {
    const services = await getWithCache('services:all', () =>
        prisma.serviceMaster.findMany({ orderBy: { uid: 'asc' } })
    );
    res.json(services);
};

const createService = async (req, res) => {
    const data = req.body;
    const service = await prisma.serviceMaster.create({
        data: {
            ...data,
            service_start_date: data.service_start_date ? new Date(data.service_start_date) : null,
            service_end_date: data.service_end_date ? new Date(data.service_end_date) : null,
            renewal_date: data.renewal_date ? new Date(data.renewal_date) : null,
        }
    });
    await invalidateCache('services:all');
    res.status(201).json(service);
};

// ==========================================
// 5️⃣ PO Entity Master
// ==========================================
const getPOEntities = async (req, res) => {
    const entities = await getWithCache('po_entities:all', () =>
        prisma.pOEntityMaster.findMany({ orderBy: { entity_name: 'asc' } })
    ); // Prisma capitalizes first letter after prefix => pOEntityMaster
    res.json(entities);
};

const createPOEntity = async (req, res) => {
    const { name } = req.body;
    const entity = await prisma.pOEntityMaster.create({
        data: { entity_name: name }
    });
    await invalidateCache('po_entities:all');
    res.status(201).json(entity);
};

// ==========================================
// 6️⃣ Budget Head Master
// ==========================================
const getBudgetHeads = async (req, res) => {
    const heads = await getWithCache('budget_heads:all', () =>
        prisma.budgetHeadMaster.findMany({ orderBy: { head_name: 'asc' } })
    );
    res.json(heads);
};

const createBudgetHead = async (req, res) => {
    const { name } = req.body;
    const head = await prisma.budgetHeadMaster.create({
        data: { head_name: name }
    });
    await invalidateCache('budget_heads:all');
    res.status(201).json(head);
};

// ==========================================
// 7️⃣ Tower Master
// ==========================================
const getTowers = async (req, res) => {
    const towers = await getWithCache('towers:all', () =>
        prisma.towerMaster.findMany({ orderBy: { tower_name: 'asc' } })
    );
    res.json(towers);
};

const createTower = async (req, res) => {
    const { name } = req.body;
    const tower = await prisma.towerMaster.create({
        data: { tower_name: name }
    });
    await invalidateCache('towers:all');
    res.status(201).json(tower);
};

// ==========================================
// 8️⃣ Allocation Type Master
// ==========================================
const getAllocationTypes = async (req, res) => {
    const types = await getWithCache('allocation_types:all', () =>
        prisma.allocationTypeMaster.findMany({ orderBy: { type_name: 'asc' } })
    );
    res.json(types);
};

const createAllocationType = async (req, res) => {
    const { name } = req.body;
    const type = await prisma.allocationTypeMaster.create({
        data: { type_name: name }
    });
    await invalidateCache('allocation_types:all');
    res.status(201).json(type);
};

// ==========================================
// 9️⃣ Allocation Basis Master
// ==========================================
const getAllocationBases = async (req, res) => {
    const bases = await getWithCache('allocation_bases:all', () =>
        prisma.allocationBasisMaster.findMany({ orderBy: { basis_name: 'asc' } })
    );
    res.json(bases);
};

const createAllocationBasis = async (req, res) => {
    const { name } = req.body;
    const basis = await prisma.allocationBasisMaster.create({
        data: { basis_name: name }
    });
    await invalidateCache('allocation_bases:all');
    res.status(201).json(basis);
};

module.exports = {
    getEntities, createEntity,
    getServices, createService,
    getPOEntities, createPOEntity,
    getBudgetHeads, createBudgetHead,
    getTowers, createTower,
    getAllocationTypes, createAllocationType,
    getAllocationBases, createAllocationBasis
};
