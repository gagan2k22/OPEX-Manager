const prisma = require('../prisma');

// Towers
const getTowers = async (req, res) => {
    try {
        const towers = await prisma.tower.findMany({
            include: { budget_heads: true }
        });
        res.json(towers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTower = async (req, res) => {
    try {
        const { name } = req.body;
        const tower = await prisma.tower.create({ data: { name } });
        res.status(201).json(tower);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTower = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const tower = await prisma.tower.update({ where: { id: parseInt(id) }, data: { name } });
        res.json(tower);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTower = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.tower.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Tower deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Budget Heads
const getBudgetHeads = async (req, res) => {
    try {
        const budgetHeads = await prisma.budgetHead.findMany({
            include: { tower: true }
        });
        res.json(budgetHeads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBudgetHead = async (req, res) => {
    try {
        const { name, tower_id } = req.body;
        const budgetHead = await prisma.budgetHead.create({
            data: { name, tower_id: parseInt(tower_id) }
        });
        res.status(201).json(budgetHead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBudgetHead = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tower_id } = req.body;
        const budgetHead = await prisma.budgetHead.update({
            where: { id: parseInt(id) },
            data: { name, tower_id: parseInt(tower_id) }
        });
        res.json(budgetHead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBudgetHead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.budgetHead.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Budget Head deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vendors
const getVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVendor = async (req, res) => {
    try {
        const { name, gst_number, contact_person } = req.body;
        const vendor = await prisma.vendor.create({
            data: { name, gst_number, contact_person }
        });
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gst_number, contact_person } = req.body;
        const vendor = await prisma.vendor.update({
            where: { id: parseInt(id) },
            data: { name, gst_number, contact_person }
        });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vendor.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cost Centres
const getCostCentres = async (req, res) => {
    try {
        const costCentres = await prisma.costCentre.findMany();
        res.json(costCentres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCostCentre = async (req, res) => {
    try {
        const { code, description } = req.body;
        const costCentre = await prisma.costCentre.create({
            data: { code, description }
        });
        res.status(201).json(costCentre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCostCentre = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, description } = req.body;
        const costCentre = await prisma.costCentre.update({
            where: { id: parseInt(id) },
            data: { code, description }
        });
        res.json(costCentre);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCostCentre = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costCentre.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Cost Centre deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PO Entities
const getPOEntities = async (req, res) => {
    try {
        const poEntities = await prisma.pOEntity.findMany({ orderBy: { name: 'asc' } });
        res.json(poEntities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPOEntity = async (req, res) => {
    try {
        const { name } = req.body;
        const poEntity = await prisma.pOEntity.create({ data: { name } });
        res.status(201).json(poEntity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePOEntity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const poEntity = await prisma.pOEntity.update({ where: { id: parseInt(id) }, data: { name } });
        res.json(poEntity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePOEntity = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pOEntity.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'PO Entity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Service Types
const getServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await prisma.serviceType.findMany({ orderBy: { name: 'asc' } });
        res.json(serviceTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createServiceType = async (req, res) => {
    try {
        const { name } = req.body;
        const serviceType = await prisma.serviceType.create({ data: { name } });
        res.status(201).json(serviceType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateServiceType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const serviceType = await prisma.serviceType.update({ where: { id: parseInt(id) }, data: { name } });
        res.json(serviceType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteServiceType = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.serviceType.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Service Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Allocation Bases
const getAllocationBases = async (req, res) => {
    try {
        const allocationBases = await prisma.allocationBasis.findMany({ orderBy: { name: 'asc' } });
        res.json(allocationBases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAllocationBasis = async (req, res) => {
    try {
        const { name } = req.body;
        const allocationBasis = await prisma.allocationBasis.create({ data: { name } });
        res.status(201).json(allocationBasis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAllocationBasis = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const allocationBasis = await prisma.allocationBasis.update({ where: { id: parseInt(id) }, data: { name } });
        res.json(allocationBasis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAllocationBasis = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.allocationBasis.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Allocation Basis deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTowers, createTower, updateTower, deleteTower,
    getBudgetHeads, createBudgetHead, updateBudgetHead, deleteBudgetHead,
    getVendors, createVendor, updateVendor, deleteVendor,
    getCostCentres, createCostCentre, updateCostCentre, deleteCostCentre,
    getPOEntities, createPOEntity, updatePOEntity, deletePOEntity,
    getServiceTypes, createServiceType, updateServiceType, deleteServiceType,
    getAllocationBases, createAllocationBasis, updateAllocationBasis, deleteAllocationBasis
};
