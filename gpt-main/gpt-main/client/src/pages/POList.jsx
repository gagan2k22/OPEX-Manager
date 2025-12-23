import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress, Snackbar, Alert, Chip,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, FileDownload, Visibility, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { useIsAdmin } from '../hooks/usePermissions';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';
import ExportDialog from '../components/ExportDialog';

const POList = () => {
    const [pos, setPOs] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const [selectedFiscalYears, setSelectedFiscalYears] = useState(['FY25', 'FY26']);
    const [availableFiscalYears, setAvailableFiscalYears] = useState(['FY25', 'FY26']);
    const [openExportDialog, setOpenExportDialog] = useState(false);

    const fetchPOs = async () => {
        setLoading(true);
        try {
            const { page, pageSize } = paginationModel;
            const response = await api.get(`/pos?page=${page + 1}&limit=${pageSize}`);
            setPOs(response.data || []);
            setRowCount(response.total || 0);
        } catch (error) {
            console.error('Error fetching POs:', error);
            showSnackbar('Error fetching purchase orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPOs();
    }, [paginationModel]);

    useEffect(() => {
        fetchFiscalYears();
    }, []);

    const fetchFiscalYears = async () => {
        try {
            const data = await api.get('/fiscal-years');
            if (data && data.length > 0) {
                const activeYears = data
                    .filter(fy => fy.is_active)
                    .map(fy => fy.label);
                if (activeYears.length > 0) {
                    setAvailableFiscalYears(activeYears);
                }
            }
        } catch (error) {
            console.error('Error fetching fiscal years:', error);
        }
    };

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const formatCurrency = useCallback((amount, currency = 'INR') => {
        if (amount === null || amount === undefined || isNaN(amount)) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');
    }, []);

    const handleFiscalYearChange = useCallback((event) => {
        const { target: { value } } = event;
        const newYears = typeof value === 'string' ? value.split(',') : value;
        if (newYears.length > 0) setSelectedFiscalYears(newYears);
    }, []);

    const handleExport = useCallback((format) => {
        try {
            const exportData = pos.map(po => ({
                'FY': `FY${new Date(po.poDate).getFullYear() % 100}`,
                'UID': po.lineItems && po.lineItems.length > 0 ? po.lineItems[0].uid : '-',
                'Service Description': po.lineItems && po.lineItems.length > 0 ? po.lineItems[0].description : '-',
                'Budget Head': po.budgetHead?.name || '-',
                'Entity': po.poEntity?.name || '-',
                'PR Number': po.prNumber || '-',
                'PR Date': formatDate(po.prDate),
                'PR Amount': po.prAmount || 0,
                'Currency': po.currency,
                'PO Number': po.poNumber,
                'PO Date': formatDate(po.poDate),
                'Vendor': po.vendor?.name || '-',
                'PO Value': po.poValue,
                'Common Currency Value (INR)': po.commonCurrencyValue || po.poValue,
                'Status': po.status
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'PO Tracker');

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const filename = `PO_Tracker_${timestamp}.${extension}`;

            XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
            showSnackbar(`PO data exported as ${format.toUpperCase()} successfully!`, 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            setSnackbar({ open: true, message: 'Error exporting data', severity: 'error' });
        }
    }, [pos, formatDate, showSnackbar]);

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            const payload = { ...newRow };
            // Ensure dates are sent correctly if updated
            if (payload.poDate) payload.poDate = new Date(payload.poDate).toISOString();
            if (payload.prDate) payload.prDate = new Date(payload.prDate).toISOString();

            await api.put(`/pos/${newRow.id}`, payload);
            setSnackbar({ open: true, message: 'PO updated successfully', severity: 'success' });
            return newRow;
        } catch (error) {
            console.error('Update error:', error);
            setSnackbar({ open: true, message: 'Error updating PO: ' + (error.message || 'Unknown error'), severity: 'error' });
            return oldRow;
        }
    };

    const handleProcessRowUpdateError = (error) => {
        setSnackbar({ open: true, message: 'Error processing update', severity: 'error' });
        console.error('Process row update error:', error);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Draft': 'default',
            'Submitted': 'info',
            'Approved': 'success',
            'Rejected': 'error',
            'Closed': 'secondary'
        };
        return colors[status] || 'default';
    };

    const columns = useMemo(() => [
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Visibility />}
                    label="View"
                    onClick={() => navigate(`/pos/${params.id}`)}
                />,
                ...(isAdmin ? [<GridActionsCellItem
                    icon={<Edit />}
                    label="Edit"
                    onClick={() => navigate(`/pos/${params.id}/edit`)}
                    showInMenu={false}
                />] : [])
            ]
        },
        {
            field: 'fy',
            headerName: 'FY',
            width: 70,
            valueGetter: (value, row) => row?.poDate ? `FY${new Date(row.poDate).getFullYear() % 100}` : '-'
        },
        {
            field: 'uid',
            headerName: 'UID',
            width: 150,
            valueGetter: (value, row) => row?.lineItems?.[0]?.uid || '-'
        },
        {
            field: 'service_description',
            headerName: 'Service',
            width: 200,
            valueGetter: (value, row) => row?.lineItems?.[0]?.description || '-'
        },
        { field: 'budgetHeadName', headerName: 'Budget Head', width: 150, valueGetter: (value, row) => row?.budgetHead?.name || '-' },
        { field: 'poEntityName', headerName: 'PO Entity', width: 120, valueGetter: (value, row) => row?.poEntity?.name || '-' },
        { field: 'prNumber', headerName: 'PR Number', width: 130, editable: true },
        { field: 'prDate', headerName: 'PR Date', width: 110, valueFormatter: (value) => formatDate(value), type: 'date', valueGetter: (value) => value ? new Date(value) : null, editable: true },
        {
            field: 'prAmount',
            headerName: 'PR Amount',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value),
            editable: true
        },
        { field: 'currency', headerName: 'Currency', width: 80, editable: true },
        { field: 'poNumber', headerName: 'PO Number', width: 130, editable: true },
        { field: 'poDate', headerName: 'PO Date', width: 110, valueFormatter: (value) => formatDate(value), type: 'date', valueGetter: (value) => value ? new Date(value) : null, editable: true },
        { field: 'vendorName', headerName: 'Vendor', width: 150, valueGetter: (value, row) => row?.vendor?.name || '-' },
        {
            field: 'poValue',
            headerName: 'PO Value',
            width: 120,
            type: 'number',
            valueFormatter: (value, row) => formatCurrency(value, row?.currency),
            editable: true
        },
        {
            field: 'commonCurrencyValue',
            headerName: 'Common Currency Value (INR)',
            width: 180,
            type: 'number',
            valueGetter: (value, row) => row?.commonCurrencyValue || row?.poValue,
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'valueInLac',
            headerName: 'Value in Lac',
            width: 120,
            valueFormatter: (value) => value ? `₹${value.toFixed(2)}L` : '-'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    size="small"
                    sx={{ borderRadius: '4px' }}
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Visibility />}
                    label="View"
                    onClick={() => navigate(`/pos/${params.id}`)}
                />,
                ...(isAdmin ? [<GridActionsCellItem
                    icon={<Edit />}
                    label="Edit"
                    onClick={() => navigate(`/pos/${params.id}/edit`)}
                    showInMenu={false}
                />] : [])
            ]
        }
    ], [isAdmin, navigate, formatDate, formatCurrency]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    PO
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={() => setOpenExportDialog(true)}
                        color="success"
                    >
                        Export
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/pos/new')}
                    >
                        Create PO
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl sx={{ m: 1, width: 300 }} size="small">
                    <InputLabel id="fiscal-year-select-label">View Fiscal Years</InputLabel>
                    <Select
                        labelId="fiscal-year-select-label"
                        id="fiscal-year-select"
                        multiple
                        value={selectedFiscalYears}
                        onChange={handleFiscalYearChange}
                        input={<OutlinedInput label="View Fiscal Years" />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {availableFiscalYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                <Checkbox checked={selectedFiscalYears.indexOf(year) > -1} />
                                <ListItemText primary={year} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Select one or more fiscal years to display
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={pos}
                    columns={columns}
                    getRowId={(row) => row.id}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={handleProcessRowUpdateError}

                    // Server-side Pagination
                    rowCount={rowCount}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}

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
                        }
                    }}
                />
            </Paper>

            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default POList;
