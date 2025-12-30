import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Box, Typography, Button, Snackbar, Alert, IconButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
    Autocomplete
} from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: '2-digit'
    }).replace(/ /g, '-');
};

const BudgetList = () => {
    const { searchQuery, triggerAddEntry, setTriggerAddEntry } = useOutletContext();
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');

    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    // Pagination removed for full table view
    // const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({});
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [towers, setTowers] = useState([]);
    const [poEntities, setPoEntities] = useState([]);
    const [allocTypes, setAllocTypes] = useState([]); // Maps to service_type
    const [allocBases, setAllocBases] = useState([]);
    const [currencyRates, setCurrencyRates] = useState({});

    // Fetch currency rates globally
    useEffect(() => {
        api.get('/master/currencies')
            .then(response => {
                const map = {};
                // Handle response format variations
                const rates = Array.isArray(response) ? response : response.data || [];
                rates.forEach(c => map[c.code] = c.rate);
                setCurrencyRates(map);
            })
            .catch(err => console.error("Failed to fetch rates", err));
    }, []);

    // Helper to Convert to INR
    const toINR = (amount, currencyCode) => {
        if (!amount) return 0;
        // Default to 1 (INR) if currency is missing or invalid
        const rate = currencyRates[currencyCode] || 1;
        return amount * rate;
    };

    // Fetch master data for autocomplete
    useEffect(() => {
        if (addDialogOpen) {
            Promise.all([
                api.get('/master/budget-heads'),
                api.get('/master/towers'),
                api.get('/master/po-entities'),
                api.get('/master/allocation-types'),
                api.get('/master/allocation-bases')
            ]).then(([heads, towersData, pos, types, bases]) => {
                setBudgetHeads(heads.map(i => i.head_name));
                setTowers(towersData.map(i => i.tower_name));
                setPoEntities(pos.map(i => i.entity_name));
                setAllocTypes(types.map(i => i.type_name));
                setAllocBases(bases.map(i => i.basis_name));
            }).catch(err => console.error("Failed to fetch master data", err));
        }
    }, [addDialogOpen]);

    useEffect(() => {
        if (triggerAddEntry) {
            setAddDialogOpen(true);
            setTriggerAddEntry(false); // Reset trigger
        }
    }, [triggerAddEntry, setTriggerAddEntry]);

    useEffect(() => {
        fetchTrackerData();
    }, [searchQuery]);

    const fetchTrackerData = async () => {
        setLoading(true);
        try {
            // Fetch all data (up to 10000 limit) to simulate "no limit"
            const result = await api.get(`/budgets/tracker?page=0&pageSize=10000&search=${searchQuery}`);
            setData(result.rows || []);
            setTotalCount(result.totalCount || 0);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/imports/xls', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showSnackbar('Import successful!');
            fetchTrackerData();
        } catch (error) {
            showSnackbar('Import failed: ' + (error.response?.data?.message || 'Check logs'), 'error');
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleDeleteRow = (id) => {
        setRowToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!rowToDelete) return;
        try {
            console.log('Deleting row:', rowToDelete);
            await api.delete(`/budgets/tracker/${rowToDelete}`);
            // Use loose comparison to match number vs string ID
            setData(prev => prev.filter(r => r.id != rowToDelete));
            showSnackbar('Deleted successfully');
        } catch (error) {
            console.error('Delete failed:', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
            showSnackbar('Delete failed: ' + msg, 'error');
        } finally {
            setDeleteDialogOpen(false);
            setRowToDelete(null);
        }
    };

    const handleAddSubmit = async () => {
        // Validate required fields
        if (!newEntry.uid || !newEntry.vendor || !newEntry.description) {
            window.alert('Please update the information to add the budget');
            return;
        }

        try {
            await api.post('/budgets/tracker', newEntry);
            showSnackbar('Entry created successfully');
            setAddDialogOpen(false);
            setNewEntry({});
            fetchTrackerData();
        } catch (error) {
            console.error('Create failed:', error);
            const msg = error.response?.data?.detail || error.message;
            showSnackbar('Create failed: ' + msg, 'error');
        }
    };

    const handleInputChange = (field, value) => {
        setNewEntry(prev => ({ ...prev, [field]: value }));
    };

    const columns = [
        {
            field: 'sr_no',
            headerName: 'Sr. No',
            width: 70,
            filterable: false,
            sortable: false,
            // Calculate sequential index (1-based)
            valueGetter: (params) => {
                // Fallback if APIs are tricky, but mostly this works.
                // Actually valueGetter params are different in v6. It receives (value, row).
                // It does NOT receive 'api' or 'index' directly in v6 signature (value, row).
                // So we must use renderCell or modify data source.
                return null;
            },
            renderCell: (params) => params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
            align: 'center',
            headerAlign: 'center',
            pinned: 'left'
        },
        { field: 'uid', headerName: 'UID', width: 100, pinned: 'left', editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'parent_uid', headerName: 'Parent UID', width: 90, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'vendor', headerName: 'Vendor', width: 100, pinned: 'left', editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'description', headerName: 'Service Description', width: 150, editable: isAdmin, align: 'left', headerAlign: 'left' },
        {
            field: 'service_start_date', headerName: 'Start Date', width: 90,
            valueGetter: (value) => value ? new Date(value) : null,
            valueFormatter: (value) => value ? formatDate(value) : '-',
            editable: isAdmin, align: 'center', headerAlign: 'center'
        },
        {
            field: 'service_end_date', headerName: 'End Date', width: 90,
            valueGetter: (value) => value ? new Date(value) : null,
            valueFormatter: (value) => value ? formatDate(value) : '-',
            editable: isAdmin, align: 'center', headerAlign: 'center'
        },
        {
            field: 'renewal_month', headerName: 'Renewal Month', width: 90,
            valueGetter: (value) => value ? new Date(value) : null,
            valueFormatter: (value) => value ? formatDate(value) : '-',
            editable: isAdmin, align: 'center', headerAlign: 'center'
        },
        { field: 'budget_head', headerName: 'Budget Head', width: 100, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'tower', headerName: 'Tower', width: 70, editable: isAdmin, align: 'center', headerAlign: 'center' },
        { field: 'contract', headerName: 'Contract', width: 80, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'po_entity', headerName: 'PO Entity', width: 150, editable: isAdmin, align: 'center', headerAlign: 'center' },
        { field: 'allocation_basis', headerName: 'Allocation Basis', width: 100, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'initiative_type', headerName: 'Initiative Type', width: 100, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'service_type', headerName: 'Service Type', width: 90, editable: isAdmin, align: 'left', headerAlign: 'left' },
        { field: 'currency', headerName: 'Cur', width: 60, editable: isAdmin, align: 'center', headerAlign: 'center' },
        {
            field: 'fy_budget', headerName: 'Budget (INR)', width: 110, type: 'number',
            valueGetter: (value, row) => toINR(value, row.currency),
            valueFormatter: (value) => formatCurrency(value),
            editable: isAdmin, align: 'right', headerAlign: 'right'
        },
        {
            field: 'fy_actuals', headerName: 'Actual (INR)', width: 110, type: 'number',
            valueGetter: (value, row) => toINR(value, row.currency),
            valueFormatter: (value) => formatCurrency(value),
            editable: isAdmin, align: 'right', headerAlign: 'right'
        },
        { field: 'remarks', headerName: 'Remarks', width: 120, editable: isAdmin, align: 'left', headerAlign: 'left' },
        {
            field: 'variance', headerName: 'Variance (INR)', width: 110, type: 'number',
            // Auto-calculate variance from Budget - Actuals (Converted)
            valueGetter: (value, row) => {
                const b = toINR(row.fy_budget, row.currency);
                const a = toINR(row.fy_actuals, row.currency);
                return b - a;
            },
            valueFormatter: (value) => formatCurrency(value),
            cellClassName: (params) => (params.value || 0) < 0 ? 'negative-variance' : 'positive-variance',
            align: 'right', headerAlign: 'right'
        },
        {
            field: 'value_in_lac', headerName: 'Value in Lac', width: 90, type: 'number',
            valueGetter: (value, row) => {
                const val = toINR(row.fy_budget, row.currency);
                return val / 100000;
            },
            valueFormatter: (value) => value != null ? `₹${Number(value).toFixed(1)} L` : '-',
            align: 'right', headerAlign: 'right'
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', width: 80,
            getActions: (params) => {
                if (!isAdmin) return [];
                return [
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon color="error" />}
                        label="Delete"
                        onClick={() => handleDeleteRow(params.id)}
                        showInMenu={false}
                    />
                ];
            }
        }
    ];



    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, px: 2, pt: 1 }}>
                <Typography sx={{ fontWeight: 800, color: '#1a237e', fontSize: '1rem' }}>
                    BUDGET TRACKER
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        size="small"
                        component="label"
                        startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                        disabled={uploading}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}
                    >
                        {uploading ? 'Importing...' : 'Import Excel'}
                        <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileUpload} />
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    rowCount={totalCount}
                    loading={loading}
                    hideFooter
                    // Pagination props removed to avoid MIT limit error for pages > 100
                    // pageSizeOptions={[100, 500, 1000, 5000]}
                    // paginationModel={paginationModel}
                    // paginationMode="server"
                    // onPaginationModelChange={setPaginationModel}
                    processRowUpdate={async (newRow, oldRow) => {
                        if (!isAdmin) return oldRow;
                        try {
                            const updatedRow = await api.put(`/budgets/tracker/${newRow.id}`, newRow);
                            showSnackbar('Entry updated successfully');
                            // Refresh data from server to ensure we have the latest state
                            await fetchTrackerData();
                            return { ...newRow, ...updatedRow };
                        } catch (error) {
                            showSnackbar('Update failed: ' + (error.response?.data?.message || error.message), 'error');
                            return oldRow;
                        }
                    }}
                    onProcessRowUpdateError={(error) => {
                        console.error('Row update error:', error);
                        showSnackbar('Update error: ' + error.message, 'error');
                    }}
                    slots={{ toolbar: GridToolbar }}
                    density="compact"
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f1f3f4',
                            minHeight: '28px !important',
                            maxHeight: '28px !important',
                            lineHeight: '1 !important'
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontSize: '8.5px',
                            fontWeight: 900,
                            whiteSpace: 'normal',
                            lineHeight: '1.1',
                            textAlign: 'center'
                        },
                        '& .MuiDataGrid-cell': {
                            fontSize: '8.5px',
                            padding: '0 2px !important',
                            borderBottom: '1px solid #f5f5f5',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            minHeight: '30px !important',
                            maxHeight: '30px !important'
                        },
                        '& .negative-variance': { color: '#d32f2f', fontWeight: 700 },
                        '& .positive-variance': { color: '#2e7d32', fontWeight: 700 }
                    }}
                />
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Budget Entry</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Fill in the details for the new budget line item.
                    </DialogContentText>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 1 }}>
                        {['uid', 'parent_uid', 'vendor', 'description', 'budget_head', 'tower', 'contract', 'po_entity', 'allocation_basis', 'initiative_type', 'service_type', 'currency', 'remarks'].map(field => {
                            // Define options map
                            const dropdownOptions = {
                                budget_head: budgetHeads,
                                tower: towers,
                                po_entity: poEntities,
                                service_type: allocTypes,     // Mapped to Allocation Type
                                allocation_basis: allocBases
                            };

                            if (dropdownOptions[field]) {
                                return (
                                    <Autocomplete
                                        key={field}
                                        options={dropdownOptions[field]}
                                        // Strict selection: freeSolo not set (default false)
                                        value={newEntry[field] || ''}
                                        onChange={(event, newValue) => handleInputChange(field, newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={field.replace(/_/g, ' ').toUpperCase()}
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                );
                            }
                            return (
                                <TextField
                                    key={field}
                                    label={field.replace(/_/g, ' ').toUpperCase()}
                                    value={newEntry[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                            );
                        })}
                        <TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={newEntry.service_start_date || ''} onChange={(e) => handleInputChange('service_start_date', e.target.value)} size="small" />
                        <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} value={newEntry.service_end_date || ''} onChange={(e) => handleInputChange('service_end_date', e.target.value)} size="small" />
                        <TextField label="Renewal Month" type="date" InputLabelProps={{ shrink: true }} value={newEntry.renewal_month || ''} onChange={(e) => handleInputChange('renewal_month', e.target.value)} size="small" />
                        <TextField label="Budget" type="number" value={newEntry.budget || ''} onChange={(e) => handleInputChange('budget', parseFloat(e.target.value))} size="small" />
                        <TextField label="Actuals" type="number" value={newEntry.actuals || ''} onChange={(e) => handleInputChange('actuals', parseFloat(e.target.value))} size="small" />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddSubmit} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetList;
