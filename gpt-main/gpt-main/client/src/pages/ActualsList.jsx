import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, TextField, MenuItem, Snackbar, Alert,
    Chip, Divider
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, CheckCircle, Cancel, Receipt } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
import api from '../utils/api';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [masters, setMasters] = useState({
        fiscalYears: [],
        costCenters: [],
        expenseCategories: [],
        vendors: []
    });
    const [formData, setFormData] = useState({
        fiscalYearId: '',
        costCenterId: '',
        expenseCategoryId: '',
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: '',
        baseAmount: '',
        gstPercent: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchExpenses();
        fetchMasterData();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await api.get('/expenses');
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            showSnackbar('Error fetching expenses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [years, centers, categories, vendors] = await Promise.all([
                api.get('/master/fiscal-years'),
                api.get('/master/cost-centers'),
                api.get('/master/expense-categories'),
                api.get('/master/vendors')
            ]);
            setMasters({ fiscalYears: years, costCenters: centers, expenseCategories: categories, vendors });
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-populate GST % when category changes
    useEffect(() => {
        if (formData.expenseCategoryId) {
            const category = masters.expenseCategories.find(c => c.id === formData.expenseCategoryId);
            if (category) {
                setFormData(prev => ({ ...prev, gstPercent: category.defaultGstPercent }));
            }
        }
    }, [formData.expenseCategoryId, masters.expenseCategories]);

    const handleSubmit = async () => {
        try {
            await api.post('/expenses', formData);
            showSnackbar('Expense created and funds blocked successfully', 'success');
            setOpenDialog(false);
            fetchExpenses();
        } catch (error) {
            showSnackbar(error.message || 'Error saving expense. Check budget available.', 'error');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/expenses/${id}/status`, { status, remarks: `Processed by UI` });
            showSnackbar(`Expense ${status} successfully`, 'success');
            fetchExpenses();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'uid', headerName: 'UID', width: 120, valueGetter: (value, row) => row.uid || row.service?.uid },
        { field: 'invoiceNumber', headerName: 'Invoice No', width: 130 },
        { field: 'invoiceDate', headerName: 'Invoice Date', width: 110, valueFormatter: (value) => new Date(value).toLocaleDateString('en-GB') },
        { field: 'vendor', headerName: 'Vendor', width: 180, valueGetter: (value, row) => row.vendor?.name },
        { field: 'costCenter', headerName: 'Cost Center', width: 120, valueGetter: (value, row) => row.costCenter?.code },
        { field: 'expenseCategory', headerName: 'Category', width: 150, valueGetter: (value, row) => row.expenseCategory?.name },
        { field: 'totalAmount', headerName: 'Amount', width: 140, type: 'number', valueFormatter: (value) => formatCurrency(value) },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                const status = params.value;
                let color = 'default';
                if (status === 'APPROVED') color = 'success';
                if (status === 'REJECTED') color = 'error';
                if (status === 'CREATED') color = 'primary';
                return <Chip size="small" label={status} color={color} variant="filled" />;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => {
                if (params.row.status !== 'CREATED') return null;
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(params.row.id, 'APPROVED')} startIcon={<CheckCircle />}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleStatusUpdate(params.row.id, 'REJECTED')} startIcon={<Cancel />}>Reject</Button>
                    </Box>
                );
            }
        }
    ];

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Actuals Management</Typography>
                <Button variant="contained" startIcon={<Receipt />} onClick={() => setOpenDialog(true)}>
                    Enter New Actual
                </Button>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 'calc(100vh - 180px)', border: '1px solid #d0d7de', borderRadius: '8px' }}>
                <DataGrid
                    rows={expenses}
                    columns={columns}
                    loading={loading}
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    sx={{ fontSize: '11px', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa' } }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>New Expense Entry (Hard Enforcement)</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Invoice Date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Vendor" name="vendorId" value={formData.vendorId} onChange={handleInputChange}>
                                {masters.vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.name} ({v.gstin || 'No GST'})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Financial Year" name="fiscalYearId" value={formData.fiscalYearId} onChange={handleInputChange}>
                                {masters.fiscalYears.map(fy => <MenuItem key={fy.id} value={fy.id}>{fy.name}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Cost Center" name="costCenterId" value={formData.costCenterId} onChange={handleInputChange}>
                                {masters.costCenters.map(cc => <MenuItem key={cc.id} value={cc.id}>{cc.code} - {cc.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Expense Category" name="expenseCategoryId" value={formData.expenseCategoryId} onChange={handleInputChange}>
                                {masters.expenseCategories.map(ec => <MenuItem key={ec.id} value={ec.id}>{ec.name} ({ec.nature})</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}><Divider>Financial Totals</Divider></Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Base Amount" name="baseAmount" value={formData.baseAmount} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="GST %" name="gstPercent" value={formData.gstPercent} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 2, bgcolor: '#f6f8fa', borderRadius: 1, border: '1px solid #d0d7de' }}>
                                <Typography variant="caption" color="text.secondary">Total Amount (System Calculated)</Typography>
                                <Typography variant="h6">{formatCurrency(parseFloat(formData.baseAmount || 0) * (1 + (parseFloat(formData.gstPercent || 0) / 100)))}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.baseAmount || !formData.costCenterId}>Submit Invoice</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ExpenseList;
