import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, TextField, MenuItem, Snackbar, Alert
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Add, FileDownload, Upload } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
import api from '../utils/api';
import ImportModal from '../components/ImportModal';
import ExportDialog from '../components/ExportDialog';
import * as XLSX from 'xlsx';

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
    const [openImportModal, setOpenImportModal] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({ uid: '', vendor_id: '' });
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
        const saved = localStorage.getItem('budgetListColumnVisibility');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        fetchBudgets();
        fetchMasterData();
    }, []);

    const fetchBudgets = async () => {
        try {
            const data = await api.get('/budgets/tracker');
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            showSnackbar('Error fetching budget data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const data = await api.get('/master/vendors');
            setVendors(data);
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
            await api.post('/budgets', formData);
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

    const handleExport = async (format) => {
        try {
            if (format === 'xlsx') {
                // Use backend export for better formatting and full data
                const response = await api.get('/budgets/export?template=upload', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'budget_export.xlsx');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                // Use XLSX library for quick CSV export of current view
                const exportData = budgets.map(b => ({
                    'FY': b.fiscal_year_name || 'FY25',
                    'UID': b.uid,
                    'Vendor': b.vendor_name,
                    'Service Description': b.service_description,
                    'Contract': b.contract_id,
                    'Start Date': formatDate(b.service_start_date),
                    'End Date': formatDate(b.service_end_date),
                    'Budget Head': b.budget_head_name,
                    'Tower': b.tower_name,
                    'Budget': b.fy25_budget
                }));
                const ws = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'budget_export.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            showSnackbar('Export successful', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showSnackbar('Error exporting data', 'error');
        }
    };

    const handleColumnVisibilityChange = useCallback((newModel) => {
        setColumnVisibilityModel(newModel);
        localStorage.setItem('budgetListColumnVisibility', JSON.stringify(newModel));
    }, []);

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            // Only send changed fields and ID
            const payload = { ...newRow };
            await api.put(`/budgets/line-items/${newRow.id}`, payload);
            showSnackbar('Row updated successfully', 'success');
            return newRow;
        } catch (error) {
            console.error('Update error:', error);
            showSnackbar('Error updating row: ' + (error.message || 'Unknown error'), 'error');
            return oldRow; // Revert change on error
        }
    };

    const handleProcessRowUpdateError = (error) => {
        showSnackbar('Error processing row update', 'error');
        console.error('Process row update error:', error);
    };

    const customColumns = useMemo(() => {
        const fields = new Set();
        budgets.forEach(row => {
            if (row.customFields) {
                Object.keys(row.customFields).forEach(key => fields.add(key));
            }
        });
        return Array.from(fields).map(field => ({
            field: `custom_${field}`,
            headerName: field, // Display name matches Excel header
            width: 150,
            editable: true,
            valueGetter: (value, row) => row.customFields?.[field]
        }));
    }, [budgets]);

    const columns = useMemo(() => [
        { field: 'fiscal_year_name', headerName: 'FY', width: 90, valueGetter: (value, row) => row?.fiscal_year_name || 'FY25' },
        { field: 'uid', headerName: 'UID', width: 150, editable: true },
        { field: 'parent_uid', headerName: 'Parent UID', width: 150, editable: true },
        { field: 'vendor_name', headerName: 'Vendor', width: 180 }, // Not editable inline yet due to complexity
        { field: 'service_description', headerName: 'Service Description', width: 250, editable: true },
        { field: 'contract_id', headerName: 'Contract', width: 120, editable: true },
        { field: 'service_start_date', headerName: 'Service Start Date', width: 130, valueFormatter: (value) => formatDate(value), type: 'date', valueGetter: (value) => value ? new Date(value) : null, editable: true },
        { field: 'service_end_date', headerName: 'Service End Date', width: 130, valueFormatter: (value) => formatDate(value), type: 'date', valueGetter: (value) => value ? new Date(value) : null, editable: true },
        { field: 'renewal_date', headerName: 'Renewal Date', width: 130, valueFormatter: (value) => formatDate(value), type: 'date', valueGetter: (value) => value ? new Date(value) : null, editable: true },
        { field: 'budget_head_name', headerName: 'Budget Head', width: 150 },
        { field: 'tower_name', headerName: 'Tower', width: 120 },
        { field: 'po_entity_name', headerName: 'PO Entity', width: 120 },
        { field: 'allocation_type', headerName: 'Allocation Type', width: 150, editable: true },
        { field: 'allocation_basis_name', headerName: 'Allocation Basis', width: 150 },
        { field: 'initiative_type', headerName: 'Initiative Type', width: 150, editable: true },
        { field: 'service_type_name', headerName: 'Service Type', width: 150 },
        { field: 'priority', headerName: 'Priority', width: 120, editable: true },
        { field: 'cost_optimization_lever', headerName: 'Cost Opt. Lever', width: 180, editable: true },
        ...customColumns,
        {
            field: 'fy25_budget',
            headerName: 'FY25 Budget',
            width: 140,
            type: 'number',
            valueFormatter: (value) => {
                if (value == null) return '-';
                return formatCurrency(value);
            }
        },
        {
            field: 'total_actual',
            headerName: 'Actual',
            width: 140,
            type: 'number',
            valueFormatter: (value) => {
                if (value == null) return '-';
                return formatCurrency(value);
            }
        },
        {
            field: 'variance',
            headerName: 'Variance',
            width: 140,
            type: 'number',
            valueGetter: (value, row) => {
                const budget = row?.fy25_budget || 0;
                const actual = row?.total_actual || 0;
                return budget - actual;
            },
            valueFormatter: (value) => {
                if (value == null) return '-';
                return formatCurrency(value);
            },
            cellClassName: (params) => {
                if (params.value < 0) return 'variance-negative';
                return 'variance-positive';
            }
        },
        { field: 'remarks', headerName: 'Remarks', width: 200, editable: true },
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="success" startIcon={<FileDownload />} onClick={() => setOpenExportDialog(true)}>
                        Export
                    </Button>
                    <Button variant="outlined" startIcon={<Upload />} onClick={() => setOpenImportModal(true)}>
                        Upload Budget
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                        Add Line Item
                    </Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={budgets}
                    columns={columns}
                    getRowId={(row) => row.id || row.tempId || Math.random()}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={handleColumnVisibilityChange}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={handleProcessRowUpdateError}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        fontSize: '9px',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f6f8fa',
                            color: '#24292f',
                            fontWeight: 'bold',
                            fontSize: '9px',
                        },
                        '& .MuiDataGrid-cell': {
                            borderRight: '1px solid #e0e0e0',
                            fontSize: '9px',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                        '& .variance-positive': {
                            color: '#2e7d32',
                            fontWeight: 'bold',
                        },
                        '& .variance-negative': {
                            color: '#d32f2f',
                            fontWeight: 'bold',
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

            <ImportModal
                open={openImportModal}
                onClose={() => setOpenImportModal(false)}
                onSuccess={() => {
                    fetchBudgets();
                    showSnackbar('Budget imported successfully', 'success');
                }}
            />

            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BudgetList;
