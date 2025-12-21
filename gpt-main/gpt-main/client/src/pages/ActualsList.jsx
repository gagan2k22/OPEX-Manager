import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { excelTableStyles } from '../styles/excelTableStyles';
import ColumnFilter from '../components/ColumnFilter';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
import api from '../utils/api';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { FileDownload, Upload } from '@mui/icons-material';
import ActualsImportModal from '../components/ActualsImportModal';
import ExportDialog from '../components/ExportDialog';
import * as XLSX from 'xlsx';
import { Button } from '@mui/material';

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

// ... (keep existing imports, except Table ones if unused)

const ActualsList = () => {
    const [actuals, setActuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openImportModal, setOpenImportModal] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
        const saved = localStorage.getItem('actualsListColumnVisibility');
        return saved ? JSON.parse(saved) : {};
    });

    // filters state is optional with DataGrid built-in filters, but I'll keep the logic if I pass filtered rows, 
    // OR BETTER: Use DataGrid's native filtering.
    // The previous implementation had manual filters. DataGrid is powerful enough.
    // I will pass 'actuals' directly to rows and let DataGrid handle filtering if the user wants.
    // But to match the previous code that "pre-filtered" or used 'filters' state...
    // Actually, I'll remove the manual filter inputs from the UI because DataGrid has a toolbar filter.
    // So I can remove the 'filters' state and 'handleFilterChange' and 'filteredActuals'.

    const fetchActuals = async () => {
        try {
            const data = await api.get('/budgets/tracker');
            setActuals(data);
        } catch (error) {
            console.error('Error fetching actuals:', error);
            setSnackbar({ open: true, message: 'Error fetching actuals data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActuals();
    }, []);

    const handleExport = async (format) => {
        try {
            const exportData = actuals.map(a => ({
                'FY': a.fiscal_year_name || 'FY25',
                'UID': a.uid,
                'Vendor': a.vendor_name,
                'Description': a.service_description,
                'Contract': a.contract_id,
                'Start Date': formatDate(a.service_start_date),
                'End Date': formatDate(a.service_end_date),
                'Budget Head': a.budget_head_name,
                'Tower': a.tower_name,
                'Actuals': a.fy25_actuals
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Actuals');

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const filename = `Actuals_Report_${timestamp}.${extension}`;

            XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
            setSnackbar({ open: true, message: `Data exported as ${format.toUpperCase()} successfully!`, severity: 'success' });
        } catch (error) {
            console.error('Export error:', error);
            setSnackbar({ open: true, message: 'Error exporting data', severity: 'error' });
        }
    };

    const handleColumnVisibilityChange = useCallback((newModel) => {
        setColumnVisibilityModel(newModel);
        localStorage.setItem('actualsListColumnVisibility', JSON.stringify(newModel));
    }, []);

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            const payload = { ...newRow };
            await api.put(`/budgets/line-items/${newRow.id}`, payload);
            setSnackbar({ open: true, message: 'Row updated successfully', severity: 'success' });
            return newRow;
        } catch (error) {
            console.error('Update error:', error);
            setSnackbar({ open: true, message: 'Error updating row: ' + (error.message || 'Unknown error'), severity: 'error' });
            return oldRow;
        }
    };

    const handleProcessRowUpdateError = (error) => {
        setSnackbar({ open: true, message: 'Error processing row update', severity: 'error' });
        console.error('Process row update error:', error);
    };

    const customColumns = useMemo(() => {
        const fields = new Set();
        actuals.forEach(row => {
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
    }, [actuals]);

    // Define Columns
    const columns = useMemo(() => [
        { field: 'fiscal_year_name', headerName: 'FY', width: 90, valueGetter: (value, row) => row?.fiscal_year_name || 'FY25' },
        { field: 'uid', headerName: 'UID', width: 150, editable: true },
        { field: 'parent_uid', headerName: 'Parent UID', width: 150, editable: true },
        { field: 'vendor_name', headerName: 'Vendor', width: 180 }, // Not editable inline yet
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
            field: 'fy25_actuals',
            headerName: 'FY 25 Actuals',
            width: 140,
            type: 'number',
            valueFormatter: (value) => {
                if (value == null) return '-';
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
            }
        },
        {
            field: 'variance',
            headerName: 'Variance',
            width: 140,
            type: 'number',
            valueGetter: (value, row) => {
                const budget = row?.fy25_budget || 0;
                const actual = row?.fy25_actuals || 0;
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

    if (loading) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Net Actual</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="success" startIcon={<FileDownload />} onClick={() => setOpenExportDialog(true)}>
                        Export
                    </Button>
                    <Button variant="outlined" startIcon={<Upload />} onClick={() => setOpenImportModal(true)}>
                        Upload Actuals
                    </Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={actuals}
                    columns={columns}
                    getRowId={(row) => row.id || Math.random()}
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
                            fontSize: '9px',
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

            <ActualsImportModal
                open={openImportModal}
                onClose={() => setOpenImportModal(false)}
                onSuccess={() => {
                    fetchActuals();
                    setSnackbar({ open: true, message: 'Actuals imported successfully', severity: 'success' });
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

export default ActualsList;
