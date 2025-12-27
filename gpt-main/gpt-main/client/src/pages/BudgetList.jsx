import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Snackbar, Alert
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { UploadFile } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
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
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: '2-digit'
    });
};

const BudgetList = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');

    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchTrackerData();
    }, [paginationModel]);

    const fetchTrackerData = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/budgets/tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}`);
            setData(result.rows || []);
            setTotalCount(result.totalCount || 0);
        } catch (error) {
            console.error('Error fetching tracker:', error);
            showSnackbar('Error fetching tracker data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const resp = await api.post('/imports/xls', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showSnackbar(`Successfully imported ${resp.details?.recordsMigrated || 0} records!`, 'success');
            fetchTrackerData();
        } catch (error) {
            showSnackbar('Import failed: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        {
            field: 'uid',
            headerName: 'UID',
            width: 100,
            pinned: 'left'
        },
        {
            field: 'parent_uid',
            headerName: 'Parent UID',
            width: 110
        },
        {
            field: 'vendor',
            headerName: 'Vendor',
            width: 140,
            pinned: 'left'
        },
        {
            field: 'description',
            headerName: 'Service Description',
            width: 200
        },
        {
            field: 'service_start_date',
            headerName: 'Service Start Date',
            width: 130,
            valueFormatter: (value) => formatDate(value)
        },
        {
            field: 'service_end_date',
            headerName: 'Service End Date',
            width: 130,
            valueFormatter: (value) => formatDate(value)
        },
        {
            field: 'renewal_month',
            headerName: 'Renewal Month',
            width: 120,
            valueFormatter: (value) => formatDate(value)
        },
        {
            field: 'budget_head',
            headerName: 'Budget Head',
            width: 140
        },
        {
            field: 'tower',
            headerName: 'Tower',
            width: 90
        },
        {
            field: 'contract',
            headerName: 'Contract',
            width: 110
        },
        {
            field: 'po_entity',
            headerName: 'PO Entity',
            width: 140
        },
        {
            field: 'allocation_basis',
            headerName: 'Allocation Basis',
            width: 130
        },
        {
            field: 'initiative_type',
            headerName: 'Initiative Type',
            width: 110
        },
        {
            field: 'service_type',
            headerName: 'Service Type',
            width: 110
        },
        {
            field: 'fy_budget',
            headerName: 'Budget',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'fy_actuals',
            headerName: 'Actual',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'variance',
            headerName: 'Variance',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value),
            cellClassName: (params) => {
                if (!params.value) return '';
                return params.value < 0 ? 'negative-variance' : 'positive-variance';
            }
        },
        {
            field: 'pr_number',
            headerName: 'PR Number',
            width: 120
        },
        {
            field: 'pr_date',
            headerName: 'PR Date',
            width: 110,
            valueFormatter: (value) => formatDate(value)
        },
        {
            field: 'pr_amount',
            headerName: 'PR Amount',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'currency',
            headerName: 'Currency',
            width: 90
        },
        {
            field: 'po_number',
            headerName: 'PO Number',
            width: 120
        },
        {
            field: 'po_date',
            headerName: 'PO Date',
            width: 110,
            valueFormatter: (value) => formatDate(value)
        },
        {
            field: 'po_value',
            headerName: 'PO Value',
            width: 120,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'common_currency_value_inr',
            headerName: 'Value in INR',
            width: 130,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'value_in_lac',
            headerName: 'Value in Lac',
            width: 120,
            type: 'number',
            valueFormatter: (value) => value ? `₹${value.toFixed(2)}L` : '-'
        },
        {
            field: 'remarks',
            headerName: 'Remarks',
            width: 200
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Budget Tracker</Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Import Excel'}
                        <input
                            type="file"
                            hidden
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                        />
                    </Button>
                )}
            </Box>

            <Paper variant="outlined" sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    rowCount={totalCount}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    slots={{ toolbar: GridToolbar }}
                    density="compact"
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8f9fa',
                            fontSize: '11px',
                            fontWeight: 600
                        },
                        '& .MuiDataGrid-cell': {
                            fontSize: '11px'
                        },
                        '& .negative-variance': {
                            color: '#d32f2f',
                            fontWeight: 600
                        },
                        '& .positive-variance': {
                            color: '#2e7d32',
                            fontWeight: 600
                        }
                    }}
                />
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BudgetList;
