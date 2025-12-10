import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tabs, Tab, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';

const MasterData = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');

    const [tab, setTab] = useState(0);
    const [towers, setTowers] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [costCentres, setCostCentres] = useState([]);
    const [poEntities, setPOEntities] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [allocationBases, setAllocationBases] = useState([]);
    const [currencyRates, setCurrencyRates] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // --- State and Handlers ---

    // 1. Towers
    const [openTowerDialog, setOpenTowerDialog] = useState(false);
    const [towerFormData, setTowerFormData] = useState({ id: null, name: '' });
    const handleTowerSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/towers' + (towerFormData.id ? `/${towerFormData.id}` : '');
            const method = towerFormData.id ? 'put' : 'post';
            await axios[method](url, towerFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Tower saved', severity: 'success' });
            setOpenTowerDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving tower', severity: 'error' }); }
    };
    const handleDeleteTower = async (id) => {
        if (!window.confirm('Delete Tower?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/towers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddTower = () => { setTowerFormData({ id: null, name: '' }); setOpenTowerDialog(true); };
    const openEditTower = (item) => { setTowerFormData(item); setOpenTowerDialog(true); };

    // 2. Budget Heads
    const [openBudgetHeadDialog, setOpenBudgetHeadDialog] = useState(false);
    const [budgetHeadFormData, setBudgetHeadFormData] = useState({ id: null, name: '', tower_id: '' });
    const handleBudgetHeadSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/budget-heads' + (budgetHeadFormData.id ? `/${budgetHeadFormData.id}` : '');
            const method = budgetHeadFormData.id ? 'put' : 'post';
            await axios[method](url, budgetHeadFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Budget Head saved', severity: 'success' });
            setOpenBudgetHeadDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving budget head', severity: 'error' }); }
    };
    const handleDeleteBudgetHead = async (id) => {
        if (!window.confirm('Delete Budget Head?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/budget-heads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddBudgetHead = () => { setBudgetHeadFormData({ id: null, name: '', tower_id: '' }); setOpenBudgetHeadDialog(true); };
    const openEditBudgetHead = (item) => { setBudgetHeadFormData({ id: item.id, name: item.name, tower_id: item.tower_id }); setOpenBudgetHeadDialog(true); };

    // 3. Vendors
    const [openVendorDialog, setOpenVendorDialog] = useState(false);
    const [vendorFormData, setVendorFormData] = useState({ id: null, name: '', gst_number: '', contact_person: '' });
    const handleVendorSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/vendors' + (vendorFormData.id ? `/${vendorFormData.id}` : '');
            const method = vendorFormData.id ? 'put' : 'post';
            await axios[method](url, vendorFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Vendor saved', severity: 'success' });
            setOpenVendorDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving vendor', severity: 'error' }); }
    };
    const handleDeleteVendor = async (id) => {
        if (!window.confirm('Delete Vendor?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddVendor = () => { setVendorFormData({ id: null, name: '', gst_number: '', contact_person: '' }); setOpenVendorDialog(true); };
    const openEditVendor = (item) => { setVendorFormData(item); setOpenVendorDialog(true); };

    // 4. Cost Centres
    const [openCostCentreDialog, setOpenCostCentreDialog] = useState(false);
    const [costCentreFormData, setCostCentreFormData] = useState({ id: null, code: '', description: '' });
    const handleCostCentreSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/cost-centres' + (costCentreFormData.id ? `/${costCentreFormData.id}` : '');
            const method = costCentreFormData.id ? 'put' : 'post';
            await axios[method](url, costCentreFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Cost Centre saved', severity: 'success' });
            setOpenCostCentreDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving cost centre', severity: 'error' }); }
    };
    const handleDeleteCostCentre = async (id) => {
        if (!window.confirm('Delete Cost Centre?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/cost-centres/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddCostCentre = () => { setCostCentreFormData({ id: null, code: '', description: '' }); setOpenCostCentreDialog(true); };
    const openEditCostCentre = (item) => { setCostCentreFormData(item); setOpenCostCentreDialog(true); };

    // 5. PO Entities
    const [openPOEntityDialog, setOpenPOEntityDialog] = useState(false);
    const [poEntityFormData, setPOEntityFormData] = useState({ id: null, name: '' });
    const handlePOEntitySubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/po-entities' + (poEntityFormData.id ? `/${poEntityFormData.id}` : '');
            const method = poEntityFormData.id ? 'put' : 'post';
            await axios[method](url, poEntityFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'PO Entity saved', severity: 'success' });
            setOpenPOEntityDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving PO entity', severity: 'error' }); }
    };
    const handleDeletePOEntity = async (id) => {
        if (!window.confirm('Delete PO Entity?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/po-entities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddPOEntity = () => { setPOEntityFormData({ id: null, name: '' }); setOpenPOEntityDialog(true); };
    const openEditPOEntity = (item) => { setPOEntityFormData(item); setOpenPOEntityDialog(true); };

    // 6. Service Types
    const [openServiceTypeDialog, setOpenServiceTypeDialog] = useState(false);
    const [serviceTypeFormData, setServiceTypeFormData] = useState({ id: null, name: '' });
    const handleServiceTypeSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/service-types' + (serviceTypeFormData.id ? `/${serviceTypeFormData.id}` : '');
            const method = serviceTypeFormData.id ? 'put' : 'post';
            await axios[method](url, serviceTypeFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Service Type saved', severity: 'success' });
            setOpenServiceTypeDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving service type', severity: 'error' }); }
    };
    const handleDeleteServiceType = async (id) => {
        if (!window.confirm('Delete Service Type?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/service-types/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddServiceType = () => { setServiceTypeFormData({ id: null, name: '' }); setOpenServiceTypeDialog(true); };
    const openEditServiceType = (item) => { setServiceTypeFormData(item); setOpenServiceTypeDialog(true); };

    // 7. Allocation Bases
    const [openAllocationBasisDialog, setOpenAllocationBasisDialog] = useState(false);
    const [allocationBasisFormData, setAllocationBasisFormData] = useState({ id: null, name: '' });
    const handleAllocationBasisSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/master/allocation-bases' + (allocationBasisFormData.id ? `/${allocationBasisFormData.id}` : '');
            const method = allocationBasisFormData.id ? 'put' : 'post';
            await axios[method](url, allocationBasisFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Allocation Basis saved', severity: 'success' });
            setOpenAllocationBasisDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving allocation basis', severity: 'error' }); }
    };
    const handleDeleteAllocationBasis = async (id) => {
        if (!window.confirm('Delete Allocation Basis?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/master/allocation-bases/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };
    const openAddAllocationBasis = () => { setAllocationBasisFormData({ id: null, name: '' }); setOpenAllocationBasisDialog(true); };
    const openEditAllocationBasis = (item) => { setAllocationBasisFormData(item); setOpenAllocationBasisDialog(true); };

    // 8. Currency Rates
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [rateFormData, setRateFormData] = useState({ id: null, from_currency: 'USD', to_currency: 'INR', rate: '' });

    const handleRateSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming the backend uses POST for upsert as per routes
            await axios.post('/api/currency-rates', rateFormData, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Currency Rate saved', severity: 'success' });
            setOpenRateDialog(false);
            fetchMasterData();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving rate', severity: 'error' });
        }
    };

    const handleDeleteRate = async (id) => {
        if (!window.confirm('Delete Rate?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/currency-rates/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' });
            fetchMasterData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Error deleting', severity: 'error' });
        }
    };

    const openAddRate = () => { setRateFormData({ id: null, from_currency: 'USD', to_currency: 'INR', rate: '' }); setOpenRateDialog(true); };
    const openEditRate = (item) => { setRateFormData(item); setOpenRateDialog(true); };

    // 9. Fiscal Years
    const [openFYDialog, setOpenFYDialog] = useState(false);
    const [fyFormData, setFYFormData] = useState({ id: null, label: '', start_date: '', end_date: '', is_active: true });
    const [fiscalYears, setFiscalYears] = useState([]);

    const handleFYSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = '/api/fiscal-years' + (fyFormData.id ? `/${fyFormData.id}` : ''); // Note: Edit might not be fully supported by backend yet, mostly Create and Toggle
            // Backend currently supports POST / and PATCH /:id/status. 
            // We will use POST for create. For edit, we might need to add a route or just support create.
            // Given user request "with same logic", mostly likely toggle is key, but adding new FY is good.

            if (fyFormData.id) {
                // If ID exists, it's an edit - but we only have toggle status endpoint or we need to add UPDATE endpoint.
                // For now, let's assume we can only create or toggle. 
                // Or better, let's use the toggle logic if it's just status, but for full edit we need backend support.
                // Use POST for creation.
                showSnackbar('Editing details not fully supported, primarily for Status Toggle', 'info');
            } else {
                await axios.post('/api/fiscal-years', fyFormData, { headers: { Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: 'Fiscal Year created', severity: 'success' });
            }
            setOpenFYDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving FY', severity: 'error' }); }
    };

    const handleToggleFYStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/fiscal-years/${id}/status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMasterData();
            setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
        } catch (error) { setSnackbar({ open: true, message: 'Error updating status', severity: 'error' }); }
    };

    const openAddFY = () => { setFYFormData({ id: null, label: '', start_date: '', end_date: '', is_active: true }); setOpenFYDialog(true); };

    useEffect(() => { fetchMasterData(); }, []);
    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [towersRes, budgetHeadsRes, vendorsRes, costCentresRes, poEntitiesRes, serviceTypesRes, allocationBasesRes, currencyRatesRes, fiscalYearsRes]
                = await Promise.all([
                    axios.get('/api/master/towers', config),
                    axios.get('/api/master/budget-heads', config),
                    axios.get('/api/master/vendors', config),
                    axios.get('/api/master/cost-centres', config),
                    axios.get('/api/master/po-entities', config),
                    axios.get('/api/master/service-types', config),
                    axios.get('/api/master/allocation-bases', config),
                    axios.get('/api/currency-rates', config),
                    axios.get('/api/fiscal-years', config)
                ]);
            setTowers(towersRes.data);
            setBudgetHeads(budgetHeadsRes.data);
            setVendors(vendorsRes.data);
            setCostCentres(costCentresRes.data);
            setPOEntities(poEntitiesRes.data);
            setServiceTypes(serviceTypesRes.data);
            setAllocationBases(allocationBasesRes.data);
            setCurrencyRates(currencyRatesRes.data);
            setFiscalYears(fiscalYearsRes.data);
        } catch (error) { console.error('Error fetching data:', error); }
    };

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Master Data Management</Typography>
            </Box>
            <Paper elevation={2}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }} variant="scrollable" scrollButtons="auto">
                    <Tab label="Fiscal Years" />
                    <Tab label="Towers" />
                    <Tab label="Budget Heads" />
                    <Tab label="Vendors" />
                    <Tab label="Cost Centres" />
                    <Tab label="PO Entities" />
                    <Tab label="Service Types" />
                    <Tab label="Allocation Bases" />
                    <Tab label="Currency Rates" />
                </Tabs>

                {tab === 0 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddFY}>Add Fiscal Year</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Start Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>End Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{fiscalYears.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.label || item.name}</TableCell>
                                        <TableCell>{new Date(item.startDate || item.start_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(item.endDate || item.end_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant={item.isActive || item.is_active ? "contained" : "outlined"}
                                                color={item.isActive || item.is_active ? "success" : "error"}
                                                size="small"
                                                onClick={() => handleToggleFYStatus(item.id, item.isActive || item.is_active)}
                                            >
                                                {item.isActive || item.is_active ? "Active" : "Inactive"}
                                            </Button>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                {/* Edit not fully implemented in backend yet */}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddTower}>Add Tower</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{towers.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditTower(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteTower(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddBudgetHead}>Add Budget Head</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Tower</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{budgetHeads.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.tower?.name}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditBudgetHead(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteBudgetHead(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 2 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddVendor}>Add Vendor</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>GST Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Contact Person</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{vendors.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.gst_number || '-'}</TableCell>
                                        <TableCell>{item.contact_person || '-'}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditVendor(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteVendor(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 3 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddCostCentre}>Add Cost Centre</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Description</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{costCentres.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>{item.description || '-'}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditCostCentre(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteCostCentre(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 4 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddPOEntity}>Add PO Entity</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{poEntities.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditPOEntity(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeletePOEntity(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 5 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddServiceType}>Add Service Type</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{serviceTypes.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditServiceType(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteServiceType(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 6 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddAllocationBasis}>Add Allocation Basis</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{allocationBases.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditAllocationBasis(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteAllocationBasis(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {tab === 7 && (
                    <Box>
                        {isAdmin && (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddRate}>Add Rate</Button>
                            </Box>
                        )}
                        <TableContainer>
                            <Table>
                                <TableHead><TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>From</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>To</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Last Updated</TableCell>
                                    {isAdmin && <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>}
                                </TableRow></TableHead>
                                <TableBody>{currencyRates.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.from_currency}</TableCell>
                                        <TableCell>{item.to_currency}</TableCell>
                                        <TableCell>{item.rate.toFixed(4)}</TableCell>
                                        <TableCell>{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditRate(item)}><Edit fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteRate(item.id)}><Delete fontSize="small" /></IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>

            <Dialog open={openFYDialog} onClose={() => setOpenFYDialog(false)}>
                <DialogTitle>{fyFormData.id ? 'Edit Fiscal Year' : 'Add Fiscal Year'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name (e.g., FY26)" fullWidth value={fyFormData.label} onChange={(e) => setFYFormData({ ...fyFormData, label: e.target.value })} sx={{ mb: 2 }} />
                    <TextField margin="dense" type="date" label="Start Date" fullWidth value={fyFormData.start_date} onChange={(e) => setFYFormData({ ...fyFormData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                    <TextField margin="dense" type="date" label="End Date" fullWidth value={fyFormData.end_date} onChange={(e) => setFYFormData({ ...fyFormData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                    {/* Active status is default true for new creation usually, or managed via table toggle */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFYDialog(false)}>Cancel</Button>
                    <Button onClick={handleFYSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openTowerDialog} onClose={() => setOpenTowerDialog(false)}>
                <DialogTitle>{towerFormData.id ? 'Edit Tower' : 'Add Tower'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={towerFormData.name} onChange={(e) => setTowerFormData({ ...towerFormData, name: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTowerDialog(false)}>Cancel</Button>
                    <Button onClick={handleTowerSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBudgetHeadDialog} onClose={() => setOpenBudgetHeadDialog(false)}>
                <DialogTitle>{budgetHeadFormData.id ? 'Edit Budget Head' : 'Add Budget Head'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={budgetHeadFormData.name} onChange={(e) => setBudgetHeadFormData({ ...budgetHeadFormData, name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField select margin="dense" label="Tower" fullWidth value={budgetHeadFormData.tower_id} onChange={(e) => setBudgetHeadFormData({ ...budgetHeadFormData, tower_id: e.target.value })}>
                        {towers.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBudgetHeadDialog(false)}>Cancel</Button>
                    <Button onClick={handleBudgetHeadSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openVendorDialog} onClose={() => setOpenVendorDialog(false)}>
                <DialogTitle>{vendorFormData.id ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={vendorFormData.name} onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField margin="dense" label="GST Number" fullWidth value={vendorFormData.gst_number} onChange={(e) => setVendorFormData({ ...vendorFormData, gst_number: e.target.value })} sx={{ mb: 2 }} />
                    <TextField margin="dense" label="Contact Person" fullWidth value={vendorFormData.contact_person} onChange={(e) => setVendorFormData({ ...vendorFormData, contact_person: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVendorDialog(false)}>Cancel</Button>
                    <Button onClick={handleVendorSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCostCentreDialog} onClose={() => setOpenCostCentreDialog(false)}>
                <DialogTitle>{costCentreFormData.id ? 'Edit Cost Centre' : 'Add Cost Centre'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Code" fullWidth value={costCentreFormData.code} onChange={(e) => setCostCentreFormData({ ...costCentreFormData, code: e.target.value })} sx={{ mb: 2 }} />
                    <TextField margin="dense" label="Description" fullWidth value={costCentreFormData.description} onChange={(e) => setCostCentreFormData({ ...costCentreFormData, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCostCentreDialog(false)}>Cancel</Button>
                    <Button onClick={handleCostCentreSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPOEntityDialog} onClose={() => setOpenPOEntityDialog(false)}>
                <DialogTitle>{poEntityFormData.id ? 'Edit PO Entity' : 'Add PO Entity'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={poEntityFormData.name} onChange={(e) => setPOEntityFormData({ ...poEntityFormData, name: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPOEntityDialog(false)}>Cancel</Button>
                    <Button onClick={handlePOEntitySubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openServiceTypeDialog} onClose={() => setOpenServiceTypeDialog(false)}>
                <DialogTitle>{serviceTypeFormData.id ? 'Edit Service Type' : 'Add Service Type'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={serviceTypeFormData.name} onChange={(e) => setServiceTypeFormData({ ...serviceTypeFormData, name: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenServiceTypeDialog(false)}>Cancel</Button>
                    <Button onClick={handleServiceTypeSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAllocationBasisDialog} onClose={() => setOpenAllocationBasisDialog(false)}>
                <DialogTitle>{allocationBasisFormData.id ? 'Edit Allocation Basis' : 'Add Allocation Basis'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Name" fullWidth value={allocationBasisFormData.name} onChange={(e) => setAllocationBasisFormData({ ...allocationBasisFormData, name: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllocationBasisDialog(false)}>Cancel</Button>
                    <Button onClick={handleAllocationBasisSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openRateDialog} onClose={() => setOpenRateDialog(false)}>
                <DialogTitle>{rateFormData.id ? 'Edit Rate' : 'Add Rate'}</DialogTitle>
                <DialogContent>
                    <TextField select margin="dense" label="From Currency" fullWidth value={rateFormData.from_currency} onChange={(e) => setRateFormData({ ...rateFormData, from_currency: e.target.value })} sx={{ mb: 2 }}>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="CAD">CAD</MenuItem>
                        <MenuItem value="INR">INR</MenuItem>
                    </TextField>
                    <TextField select margin="dense" label="To Currency" fullWidth value={rateFormData.to_currency} disabled>
                        <MenuItem value="INR">INR</MenuItem>
                    </TextField>
                    <TextField margin="dense" label="Rate" type="number" fullWidth value={rateFormData.rate} onChange={(e) => setRateFormData({ ...rateFormData, rate: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRateDialog(false)}>Cancel</Button>
                    <Button onClick={handleRateSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};
export default MasterData;
