import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, TextField, MenuItem, Snackbar, Alert
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
import axios from 'axios';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-');
};

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const BudgetList = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({ uid: '', vendor_id: '' });

    useEffect(() => {
        fetchBudgets();
        fetchMasterData();
    }, []);

    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/budgets/tracker', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            showSnackbar('Error fetching budget data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const vendorsRes = await axios.get('/api/vendors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(vendorsRes.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/budgets', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('Line item added successfully', 'success');
            setOpenDialog(false);
            setFormData({ uid: '', vendor_id: '' });
            fetchBudgets();
        } catch (error) {
            console.error('Error adding line item:', error);
            showSnackbar('Error adding line item', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = useMemo(() => [
        { field: 'fiscal_year_name', headerName: 'FY', width: 90, valueGetter: (params) => params.row?.fiscal_year_name || 'FY25' },
        { field: 'uid', headerName: 'UID', width: 150 },
        { field: 'vendor_name', headerName: 'Vendor', width: 180 },
        { field: 'service_description', headerName: 'Service Description', width: 250 },
        { field: 'contract_id', headerName: 'Contract', width: 120 },
        { field: 'service_start_date', headerName: 'Service Start Date', width: 130, valueFormatter: (params) => formatDate(params?.value) },
        { field: 'service_end_date', headerName: 'Service End Date', width: 130, valueFormatter: (params) => formatDate(params?.value) },
        { field: 'renewal_date', headerName: 'Renewal Date', width: 130, valueFormatter: (params) => formatDate(params?.value) },
        { field: 'budget_head_name', headerName: 'Budget Head', width: 150 },
        { field: 'tower_name', headerName: 'Tower', width: 120 },
        { field: 'po_entity_name', headerName: 'PO Entity', width: 120 },
        { field: 'allocation_type', headerName: 'Allocation Type', width: 150 },
        { field: 'allocation_basis_name', headerName: 'Allocation Basis', width: 150 },
        { field: 'initiative_type', headerName: 'Initiative Type', width: 150 },
        { field: 'service_type_name', headerName: 'Service Type', width: 150 },
        { field: 'priority', headerName: 'Priority', width: 120 },
        { field: 'cost_optimization_lever', headerName: 'Cost Opt. Lever', width: 180 },
        {
            field: 'fy25_budget',
            headerName: 'FY25 Budget',
            width: 140,
            type: 'number',
            valueFormatter: (params) => {
                if (params.value == null) return '-';
                return formatCurrency(params.value);
            }
        },
    ], []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Net Budget</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                    Add Line Item
                </Button>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={budgets}
                    columns={columns}
                    getRowId={(row) => row.id || row.tempId || Math.random()}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f6f8fa',
                            color: '#24292f',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-cell': {
                            borderRight: '1px solid #e0e0e0',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f5f5f5',
                        }
                    }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Line Item</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label="UID" name="uid" value={formData.uid} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" select label="Vendor" name="vendor_id" value={formData.vendor_id} onChange={handleInputChange}>
                                {vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption">Form simplified for stability. Use Edit for more details.</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BudgetList;
