import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tabs, Tab, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Snackbar, Alert, Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import ExportDialog from '../components/ExportDialog';
import * as XLSX from 'xlsx';
import { FileDownload } from '@mui/icons-material';

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
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // --- State and Handlers ---

    // 1. Towers
    const [openTowerDialog, setOpenTowerDialog] = useState(false);
    const [towerFormData, setTowerFormData] = useState({ id: null, name: '' });
    const handleTowerSubmit = async () => {
        try {
            const url = '/master/towers' + (towerFormData.id ? `/${towerFormData.id}` : '');
            if (towerFormData.id) {
                await api.put(url, towerFormData);
            } else {
                await api.post(url, towerFormData);
            }
            setSnackbar({ open: true, message: 'Tower saved', severity: 'success' });
            setOpenTowerDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving tower', severity: 'error' }); }
    };
    const handleDeleteTower = async (id) => {
        if (!window.confirm('Delete Tower?')) return;
        try {
            await api.delete(`/master/towers/${id}`);
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
            const url = '/master/budget-heads' + (budgetHeadFormData.id ? `/${budgetHeadFormData.id}` : '');
            if (budgetHeadFormData.id) {
                await api.put(url, budgetHeadFormData);
            } else {
                await api.post(url, budgetHeadFormData);
            }
            setSnackbar({ open: true, message: 'Budget Head saved', severity: 'success' });
            setOpenBudgetHeadDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving budget head', severity: 'error' }); }
    };
    const handleDeleteBudgetHead = async (id) => {
        if (!window.confirm('Delete Budget Head?')) return;
        try {
            await api.delete(`/master/budget-heads/${id}`);
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
            const url = '/master/vendors' + (vendorFormData.id ? `/${vendorFormData.id}` : '');
            if (vendorFormData.id) {
                await api.put(url, vendorFormData);
            } else {
                await api.post(url, vendorFormData);
            }
            setSnackbar({ open: true, message: 'Vendor saved', severity: 'success' });
            setOpenVendorDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving vendor', severity: 'error' }); }
    };
    const handleDeleteVendor = async (id) => {
        if (!window.confirm('Delete Vendor?')) return;
        try {
            await api.delete(`/master/vendors/${id}`);
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
            const url = '/master/cost-centres' + (costCentreFormData.id ? `/${costCentreFormData.id}` : '');
            if (costCentreFormData.id) {
                await api.put(url, costCentreFormData);
            } else {
                await api.post(url, costCentreFormData);
            }
            setSnackbar({ open: true, message: 'Cost Centre saved', severity: 'success' });
            setOpenCostCentreDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving cost centre', severity: 'error' }); }
    };
    const handleDeleteCostCentre = async (id) => {
        if (!window.confirm('Delete Cost Centre?')) return;
        try {
            await api.delete(`/master/cost-centres/${id}`);
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
            const url = '/master/po-entities' + (poEntityFormData.id ? `/${poEntityFormData.id}` : '');
            if (poEntityFormData.id) { await api.put(url, poEntityFormData); }
            else { await api.post(url, poEntityFormData); }
            setSnackbar({ open: true, message: 'PO Entity saved', severity: 'success' });
            setOpenPOEntityDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving PO entity', severity: 'error' }); }
    };
    const handleDeletePOEntity = async (id) => {
        if (!window.confirm('Delete PO Entity?')) return;
        try {
            await api.delete(`/master/po-entities/${id}`);
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
            const url = '/master/service-types' + (serviceTypeFormData.id ? `/${serviceTypeFormData.id}` : '');
            if (serviceTypeFormData.id) { await api.put(url, serviceTypeFormData); }
            else { await api.post(url, serviceTypeFormData); }
            setSnackbar({ open: true, message: 'Service Type saved', severity: 'success' });
            setOpenServiceTypeDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving service type', severity: 'error' }); }
    };
    const handleDeleteServiceType = async (id) => {
        if (!window.confirm('Delete Service Type?')) return;
        try {
            await api.delete(`/master/service-types/${id}`);
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
            const url = '/master/allocation-bases' + (allocationBasisFormData.id ? `/${allocationBasisFormData.id}` : '');
            if (allocationBasisFormData.id) { await api.put(url, allocationBasisFormData); }
            else { await api.post(url, allocationBasisFormData); }
            setSnackbar({ open: true, message: 'Allocation Basis saved', severity: 'success' });
            setOpenAllocationBasisDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving allocation basis', severity: 'error' }); }
    };
    const handleDeleteAllocationBasis = async (id) => {
        if (!window.confirm('Delete Allocation Basis?')) return;
        try {
            await api.delete(`/master/allocation-bases/${id}`);
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
            await api.post('/currency-rates', rateFormData);
            setSnackbar({ open: true, message: 'Currency Rate saved', severity: 'success' });
            setOpenRateDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving rate', severity: 'error' }); }
    };

    const handleDeleteRate = async (id) => {
        if (!window.confirm('Delete Rate?')) return;
        try {
            await api.delete(`/currency-rates/${id}`);
            setSnackbar({ open: true, message: 'Deleted', severity: 'success' }); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
    };

    const openAddRate = () => { setRateFormData({ id: null, from_currency: 'USD', to_currency: 'INR', rate: '' }); setOpenRateDialog(true); };
    const openEditRate = (item) => { setRateFormData(item); setOpenRateDialog(true); };

    // 9. Fiscal Years
    const [openFYDialog, setOpenFYDialog] = useState(false);
    const [fyFormData, setFYFormData] = useState({ id: null, label: '', start_date: '', end_date: '', is_active: true });
    const [fiscalYears, setFiscalYears] = useState([]);

    const handleFYSubmit = async () => {
        try {
            if (fyFormData.id) {
                // For now, only toggle status is supported for existing FY
                showSnackbar('Editing details not fully supported, primarily for Status Toggle', 'info');
            } else {
                await api.post('/fiscal-years', fyFormData);
                setSnackbar({ open: true, message: 'Fiscal Year created', severity: 'success' });
            }
            setOpenFYDialog(false); fetchMasterData();
        } catch (error) { setSnackbar({ open: true, message: error.message || 'Error saving FY', severity: 'error' }); }
    };

    const handleToggleFYStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/fiscal-years/${id}/status`, { is_active: !currentStatus });
            fetchMasterData();
            setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
        } catch (error) { setSnackbar({ open: true, message: 'Error updating status', severity: 'error' }); }
    };

    const openAddFY = () => { setFYFormData({ id: null, label: '', start_date: '', end_date: '', is_active: true }); setOpenFYDialog(true); };

    // GENERIC UPDATE HANDLER FOR MASTER DATA
    const processMasterRowUpdate = async (newRow, oldRow, endpoint, name) => {
        try {
            await api.put(`${endpoint}/${newRow.id}`, newRow);
            setSnackbar({ open: true, message: `${name} updated successfully`, severity: 'success' });
            return newRow;
        } catch (error) {
            console.error(`Error updating ${name}:`, error);
            setSnackbar({ open: true, message: `Error updating ${name}`, severity: 'error' });
            return oldRow;
        }
    };

    const handleProcessRowUpdateError = (error) => {
        setSnackbar({ open: true, message: 'Error processing update', severity: 'error' });
    };

    const processRateUpdate = async (newRow, oldRow) => {
        try {
            await api.post('/currency-rates', newRow);
            setSnackbar({ open: true, message: 'Rate updated successfully', severity: 'success' });
            return newRow;
        } catch (error) {
            console.error('Error updating rate:', error);
            setSnackbar({ open: true, message: 'Error updating rate', severity: 'error' });
            return oldRow;
        }
    };

    useEffect(() => { fetchMasterData(); }, []);
    const fetchMasterData = async () => {
        try {
            const [towers, budgetHeads, vendors, costCentres, poEntities, serviceTypes, allocationBases, currencyRates, fiscalYears]
                = await Promise.all([
                    api.get('/master/towers'),
                    api.get('/master/budget-heads'),
                    api.get('/master/vendors'),
                    api.get('/master/cost-centres'),
                    api.get('/master/po-entities'),
                    api.get('/master/service-types'),
                    api.get('/master/allocation-bases'),
                    api.get('/currency-rates'),
                    api.get('/fiscal-years')
                ]);
            setTowers(towers);
            setBudgetHeads(budgetHeads);
            setVendors(vendors);
            setCostCentres(costCentres);
            setPOEntities(poEntities);
            setServiceTypes(serviceTypes);
            setAllocationBases(allocationBases);
            setCurrencyRates(currencyRates);
            setFiscalYears(fiscalYears);
        } catch (error) { console.error('Error fetching data:', error); }
    };

    const handleExport = (format) => {
        try {
            let data = [];
            let fileName = '';
            let sheetName = '';

            switch (tab) {
                case 0:
                    data = fiscalYears.map(fy => ({ Name: fy.label, 'Start Date': fy.startDate, 'End Date': fy.endDate, Status: fy.isActive ? 'Active' : 'Inactive' }));
                    fileName = 'Fiscal_Years';
                    sheetName = 'FY';
                    break;
                case 1:
                    data = towers.map(t => ({ ID: t.id, Name: t.name }));
                    fileName = 'Towers';
                    sheetName = 'Towers';
                    break;
                case 2:
                    data = budgetHeads.map(bh => ({ ID: bh.id, Name: bh.name, Tower: bh.tower?.name }));
                    fileName = 'Budget_Heads';
                    sheetName = 'BH';
                    break;
                case 3:
                    data = vendors.map(v => ({ ID: v.id, Name: v.name, 'GST Number': v.gst_number, 'Contact Person': v.contact_person }));
                    fileName = 'Vendors';
                    sheetName = 'Vendors';
                    break;
                case 4:
                    data = costCentres.map(cc => ({ ID: cc.id, Code: cc.code, Description: cc.description }));
                    fileName = 'Cost_Centres';
                    sheetName = 'CC';
                    break;
                case 5:
                    data = poEntities.map(p => ({ ID: p.id, Name: p.name }));
                    fileName = 'PO_Entities';
                    sheetName = 'Entities';
                    break;
                case 6:
                    data = serviceTypes.map(s => ({ ID: s.id, Name: s.name }));
                    fileName = 'Service_Types';
                    sheetName = 'Types';
                    break;
                case 7:
                    data = allocationBases.map(a => ({ ID: a.id, Name: a.name }));
                    fileName = 'Allocation_Bases';
                    sheetName = 'Bases';
                    break;
                case 8:
                    data = currencyRates.map(r => ({ From: r.from_currency, To: r.to_currency, Rate: r.rate, 'Last Updated': r.updated_at }));
                    fileName = 'Currency_Rates';
                    sheetName = 'Rates';
                    break;
                default:
                    return;
            }

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const fullFileName = `${fileName}_${timestamp}.${extension}`;

            XLSX.writeFile(wb, fullFileName, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
            setSnackbar({ open: true, message: `${fileName} exported as ${format.toUpperCase()} successfully!`, severity: 'success' });
        } catch (error) {
            console.error('Export error:', error);
            setSnackbar({ open: true, message: 'Error exporting data', severity: 'error' });
        }
    };

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Master Data Management</Typography>
                <Button
                    variant="outlined"
                    color="success"
                    startIcon={<FileDownload />}
                    onClick={() => setOpenExportDialog(true)}
                    size="small"
                >
                    Export Current Tab
                </Button>
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
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddFY}>Add Fiscal Year</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={fiscalYears}
                            columns={[
                                { field: 'label', headerName: 'Name', flex: 1, valueGetter: (value, row) => row?.label || row?.name },
                                {
                                    field: 'startDate',
                                    headerName: 'Start Date',
                                    width: 150,
                                    valueFormatter: (value, row) => new Date(value || row?.start_date).toLocaleDateString()
                                },
                                {
                                    field: 'endDate',
                                    headerName: 'End Date',
                                    width: 150,
                                    valueFormatter: (value, row) => new Date(value || row?.end_date).toLocaleDateString()
                                },
                                {
                                    field: 'is_active',
                                    headerName: 'Status',
                                    width: 120,
                                    renderCell: (params) => (
                                        <Button
                                            variant={params.value || params.row.isActive ? "contained" : "outlined"}
                                            color={params.value || params.row.isActive ? "success" : "error"}
                                            size="small"
                                            onClick={() => handleToggleFYStatus(params.row.id, params.value || params.row.isActive)}
                                        >
                                            {params.value || params.row.isActive ? "Active" : "Inactive"}
                                        </Button>
                                    )
                                }
                            ]}
                            getRowId={(row) => row.id}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 1 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddTower}>Add Tower</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={towers}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditTower(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteTower(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/towers', 'Tower')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 2 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddBudgetHead}>Add Budget Head</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={budgetHeads}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                {
                                    field: 'tower_name',
                                    headerName: 'Tower',
                                    flex: 1,
                                    valueGetter: (value, row) => row?.tower?.name || 'N/A'
                                },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditBudgetHead(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteBudgetHead(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/budget-heads', 'Budget Head')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 3 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddVendor}>Add Vendor</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={vendors}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                { field: 'gst_number', headerName: 'GST Number', flex: 1, editable: true },
                                { field: 'contact_person', headerName: 'Contact Person', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditVendor(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteVendor(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/vendors', 'Vendor')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 4 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddCostCentre}>Add Cost Centre</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={costCentres}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'code', headerName: 'Code', flex: 1, editable: true },
                                { field: 'description', headerName: 'Description', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditCostCentre(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteCostCentre(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/cost-centres', 'Cost Centre')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 5 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddPOEntity}>Add PO Entity</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={poEntities}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditPOEntity(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeletePOEntity(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/po-entities', 'PO Entity')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 6 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddServiceType}>Add Service Type</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={serviceTypes}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditServiceType(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteServiceType(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/service-types', 'Service Type')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 7 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddAllocationBasis}>Add Allocation Basis</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={allocationBases}
                            columns={[
                                { field: 'id', headerName: 'ID', width: 90 },
                                { field: 'name', headerName: 'Name', flex: 1, editable: true },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditAllocationBasis(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteAllocationBasis(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={(newRow, oldRow) => processMasterRowUpdate(newRow, oldRow, '/master/allocation-bases', 'Allocation Basis')}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
                    </Box>
                )}

                {tab === 8 && (
                    <Box sx={{ height: 500, width: '100%', p: 2 }}>
                        {isAdmin && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={<Add />} onClick={openAddRate}>Add Rate</Button>
                            </Box>
                        )}
                        <DataGrid
                            rows={currencyRates}
                            columns={[
                                { field: 'from_currency', headerName: 'From', width: 100 },
                                { field: 'to_currency', headerName: 'To', width: 100 },
                                {
                                    field: 'rate',
                                    headerName: 'Rate',
                                    width: 120,
                                    editable: true,
                                    valueFormatter: (value) => value ? value.toFixed(4) : '-'
                                },
                                {
                                    field: 'updated_at',
                                    headerName: 'Last Updated',
                                    flex: 1,
                                    valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
                                },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => openEditRate(params.row)} />,
                                        <GridActionsCellItem icon={<Delete />} label="Delete" color="error" onClick={() => handleDeleteRate(params.id)} />
                                    ]
                                }
                            ]}
                            getRowId={(row) => row.id}
                            processRowUpdate={processRateUpdate}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{ toolbar: GridToolbar }}
                            density="compact"
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa', fontWeight: 'bold' }
                            }}
                        />
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

            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};
export default MasterData;

