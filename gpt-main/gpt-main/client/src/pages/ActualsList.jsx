import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { excelTableStyles } from '../styles/excelTableStyles';
import ColumnFilter from '../components/ColumnFilter';
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

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// ... (keep existing imports, except Table ones if unused)

const ActualsList = () => {
    const [actuals, setActuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // filters state is optional with DataGrid built-in filters, but I'll keep the logic if I pass filtered rows, 
    // OR BETTER: Use DataGrid's native filtering.
    // The previous implementation had manual filters. DataGrid is powerful enough.
    // I will pass 'actuals' directly to rows and let DataGrid handle filtering if the user wants.
    // But to match the previous code that "pre-filtered" or used 'filters' state...
    // Actually, I'll remove the manual filter inputs from the UI because DataGrid has a toolbar filter.
    // So I can remove the 'filters' state and 'handleFilterChange' and 'filteredActuals'.

    const fetchActuals = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/budgets/tracker', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActuals(response.data);
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

    // Define Columns
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
            field: 'fy25_actuals',
            headerName: 'FY 25 Actuals',
            width: 140,
            type: 'number',
            valueFormatter: (params) => {
                if (params.value == null) return '-';
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(params.value);
            }
        },
    ], []);

    if (loading) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Net Actual</Typography>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={actuals}
                    columns={columns}
                    getRowId={(row) => row.id || Math.random()}
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
                        }
                    }}
                />
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ActualsList;
