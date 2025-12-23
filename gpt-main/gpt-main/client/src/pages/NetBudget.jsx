import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Paper, LinearProgress, TextField } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
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

const NetBudget = () => {
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        fetchNetBudgets();
    }, [paginationModel, debouncedSearch]);

    const fetchNetBudgets = async () => {
        setLoading(true);
        try {
            const searchParam = debouncedSearch ? `&search=${debouncedSearch}` : '';
            const response = await api.get(`/budgets/net-tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${searchParam}`);
            setRows(response.rows || []);
            setRowCount(response.totalRowCount || 0);
        } catch (error) {
            console.error('Error fetching net budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        { field: 'uid', headerName: 'UID', width: 130 },
        { field: 'description', headerName: 'Description', width: 250 },
        { field: 'vendor_name', headerName: 'Vendor', width: 180 },
        { field: 'tower_name', headerName: 'Tower', width: 120 },
        { field: 'budget_head_name', headerName: 'Budget Head', width: 150 },
        { field: 'fiscal_year_name', headerName: 'FY', width: 90 },
        {
            field: 'total_budget',
            headerName: 'Total Budget',
            width: 140,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'allocated_po',
            headerName: 'Allocated PO',
            width: 140,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'consumed_actuals',
            headerName: 'Consumed Actuals',
            width: 140,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'net_available',
            headerName: 'Net Available',
            width: 140,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value),
            cellClassName: (params) => params.value < 0 ? 'variance-negative' : 'variance-positive'
        },
        {
            field: 'utilization_percentage',
            headerName: 'Utilization %',
            width: 180,
            renderCell: (params) => {
                const value = Math.min(Math.max(params.value, 0), 100);
                const color = value > 90 ? 'error' : value > 70 ? 'warning' : 'success';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', gap: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={value} color={color} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: '35px' }}>{`${Math.round(params.value)}%`}</Typography>
                    </Box>
                );
            }
        }
    ], []);

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Net Budget Tracker</Typography>
                <TextField
                    size="small"
                    placeholder="Search UID/Vendor/Tower..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{ width: 300, bgcolor: 'white', borderRadius: 1 }}
                />
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowCount={rowCount}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f6f8fa',
                            borderBottom: '1px solid #d0d7de',
                        },
                        '& .variance-negative': {
                            color: '#cf222e',
                            fontWeight: 600
                        },
                        '& .variance-positive': {
                            color: '#1a7f37',
                            fontWeight: 600
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default NetBudget;
