import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, TextField, MenuItem, Snackbar, Alert,
    Chip, IconButton, Drawer, Divider
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Visibility, Edit, FileDownload, ListAlt,
    DoubleArrow, ArrowForwardIos, FileUpload
} from '@mui/icons-material';
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

const OpexTracker = () => {
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });
    const [selectedService, setSelectedService] = useState(null);
    const [splits, setSplits] = useState([]);
    const [splitsLoading, setSplitsLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [importing, setImporting] = useState(false);

    // Master data for dropdowns
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [towers, setTowers] = useState([]);
    const [poEntities, setPOEntities] = useState([]);
    const [allocationTypes, setAllocationTypes] = useState([]);
    const [allocationBases, setAllocationBases] = useState([]);

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        try {
            const resp = await api.post('/imports/xls', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showSnackbar(`Migrated ${resp.details.recordsMigrated} records and ${resp.details.entitiesDetected} entities!`, 'success');
            fetchTrackerData();
        } catch (error) {
            showSnackbar('Migration failed: ' + (error.message || 'Check logs'), 'error');
        } finally {
            setImporting(false);
        }
    };

    const [sortModel, setSortModel] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        fetchTrackerData();
        fetchMasterData();
    }, [paginationModel, sortModel, debouncedSearch]);

    const fetchMasterData = async () => {
        try {
            const [headsResp, towersResp, poEntitiesResp, allocTypesResp, allocBasesResp] = await Promise.all([
                api.get('/master/budget-heads'),
                api.get('/master/towers'),
                api.get('/master/po-entities'),
                api.get('/master/allocation-types'),
                api.get('/master/allocation-bases')
            ]);
            setBudgetHeads(headsResp.map(h => h.head_name));
            setTowers(towersResp.map(t => t.tower_name));
            setPOEntities(poEntitiesResp.map(e => e.entity_name));
            setAllocationTypes(allocTypesResp.map(t => t.type_name));
            setAllocationBases(allocBasesResp.map(b => b.basis_name));
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const fetchTrackerData = async () => {
        setLoading(true);
        try {
            const sortParam = sortModel.length > 0 ? `&sortModel=${JSON.stringify(sortModel)}` : '';
            const searchParam = debouncedSearch ? `&search=${debouncedSearch}` : '';
            const result = await api.get(`/budgets/tracker?page=${paginationModel.page}&pageSize=${paginationModel.pageSize}${sortParam}${searchParam}`);
            setData(result.rows || []);
            setTotalCount(result.totalCount || 0);
        } catch (error) {
            console.error('Error fetching tracker:', error);
            showSnackbar('Error fetching tracker data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSplits = async (service) => {
        setSelectedService(service);
        setDrawerOpen(true);
        setSplitsLoading(true);
        try {
            const result = await api.get(`/budgets/splits/${service.id}`);
            setSplits(result);
        } catch (error) {
            showSnackbar('Error fetching splits', 'error');
        } finally {
            setSplitsLoading(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const columns = [
        { field: 'fy_year', headerName: 'FY Year', width: 90 },
        { field: 'uid', headerName: 'UID', width: 120, cellClassName: 'uid-cell', editable: true },
        { field: 'parent_uid', headerName: 'Parent UID', width: 120, editable: true },
        { field: 'vendor', headerName: 'Vendor', width: 150, editable: true },
        { field: 'description', headerName: 'Service Description', width: 220, editable: true },
        {
            field: 'service_start_date',
            headerName: 'Service Start Date',
            width: 130,
            valueFormatter: (v) => formatDate(v),
            editable: true,
            type: 'date',
            valueGetter: (v) => v ? new Date(v) : null
        },
        {
            field: 'service_end_date',
            headerName: 'Service End Date',
            width: 130,
            valueFormatter: (v) => formatDate(v),
            editable: true,
            type: 'date',
            valueGetter: (v) => v ? new Date(v) : null
        },
        {
            field: 'renewal_month',
            headerName: 'Renewal Month',
            width: 130,
            valueFormatter: (v) => formatDate(v),
            editable: false,
            valueGetter: (value, row) => {
                if (row.service_start_date) {
                    const startDate = new Date(row.service_start_date);
                    const renewalDate = new Date(startDate);
                    renewalDate.setDate(renewalDate.getDate() + 364);
                    return renewalDate;
                }
                return null;
            }
        },
        {
            field: 'budget_head',
            headerName: 'Budget Head',
            width: 180,
            editable: true,
            type: 'singleSelect',
            valueOptions: budgetHeads
        },
        {
            field: 'tower',
            headerName: 'Tower',
            width: 130,
            editable: true,
            type: 'singleSelect',
            valueOptions: towers
        },
        {
            field: 'contract',
            headerName: 'Contract',
            width: 100,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['Yes', 'No']
        },
        {
            field: 'po_entity',
            headerName: 'PO Entity',
            width: 180,
            editable: true,
            type: 'singleSelect',
            valueOptions: poEntities
        },
        {
            field: 'allocation_type',
            headerName: 'Allocation Type',
            width: 130,
            editable: true,
            type: 'singleSelect',
            valueOptions: allocationTypes
        },
        {
            field: 'allocation_basis',
            headerName: 'Allocation Basis',
            width: 200,
            editable: true,
            type: 'singleSelect',
            valueOptions: allocationBases
        },
        { field: 'initiative_type', headerName: 'Initiative Type', width: 130, editable: true },
        { field: 'service_type', headerName: 'Service Type', width: 130, editable: true },
        { field: 'priority', headerName: 'Priority', width: 100, editable: true },
        {
            field: 'fy_budget',
            headerName: 'Budget',
            width: 130,
            type: 'number',
            editable: true,
            valueFormatter: (value) => formatCurrency(value),
            cellClassName: 'bold-cell'
        },
        {
            field: 'fy_actuals',
            headerName: 'Actual',
            width: 130,
            type: 'number',
            valueFormatter: (value) => formatCurrency(value),
            cellClassName: 'actuals-cell'
        },
        { field: 'currency', headerName: 'Currency', width: 90, editable: true },
        {
            field: 'common_currency_value_inr',
            headerName: 'Value In INR',
            width: 140,
            type: 'number',
            editable: true,
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'value_in_lac',
            headerName: 'Value in Lakh',
            width: 120,
            type: 'number',
            valueFormatter: (value) => value ? value.toFixed(2) : '-'
        },
        { field: 'remarks', headerName: 'Remarks', width: 200, editable: true },
        {
            field: 'actions',
            headerName: 'Monthly Splits',
            width: 140,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ListAlt />}
                    onClick={() => handleViewSplits(params.row)}
                    sx={{ fontSize: '10px', textTransform: 'none' }}
                >
                    View Splits
                </Button>
            )
        }
    ];

    const splitColumns = [
        { field: 'entity_name', headerName: 'Entity', width: 180, valueGetter: (v, row) => row.entity?.entity_name },
        { field: 'month_no', headerName: 'Month', width: 80, valueFormatter: (v) => `M${v}` },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 130,
            type: 'number',
            editable: true,
            valueFormatter: (v) => formatCurrency(v)
        }
    ];

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Jubilant OPEX Tracker (Excel → DB Logic)</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ mr: 2, bgcolor: 'white', borderRadius: 1 }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        color="primary"
                        startIcon={importing ? <CircularProgress size={20} /> : <FileUpload />}
                        disabled={importing}
                    >
                        {importing ? 'Migrating...' : 'Import Master Excel'}
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                    </Button>
                    <Button variant="outlined" color="success" startIcon={<FileDownload />}>
                        Export XLS
                    </Button>
                    <Chip label="Financial Year: FY25" color="secondary" variant="outlined" />
                </Box>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', height: 'calc(100vh - 180px)', border: '1px solid #d0d7de', borderRadius: '8px' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    loading={loading}
                    rowCount={totalCount}
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    sortingMode="server"
                    onSortModelChange={setSortModel}
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    processRowUpdate={async (newRow, oldRow) => {
                        try {
                            // Only send update if changed
                            if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;

                            await api.put(`/budgets/tracker/${newRow.id}`, newRow);
                            showSnackbar('Record updated successfully', 'success');
                            return newRow;
                        } catch (error) {
                            showSnackbar('Update failed: ' + (error.response?.data?.message || error.message), 'error');
                            return oldRow;
                        }
                    }}
                    onProcessRowUpdateError={(error) => {
                        showSnackbar('Error updating row: ' + error.message, 'error');
                    }}
                    sx={{
                        fontSize: '11px',
                        '& .uid-cell': { color: '#0969da', fontWeight: 600 },
                        '& .bold-cell': { fontWeight: 700, bgcolor: '#f6f8fa' },
                        '& .actuals-cell': { color: '#0969da', fontWeight: 600 },
                        '& .positive-val': { color: '#1a7f37' },
                        '& .negative-val': { color: '#cf222e' },
                    }}
                />
            </Paper>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: 600, p: 3 } }}
            >
                {selectedService && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Monthly Entity Splits: {selectedService.uid}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {selectedService.vendor} | {selectedService.service}
                        </Typography>
                        <Box sx={{ my: 2, p: 2, bgcolor: '#f6f8fa', borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" display="block">FY Budget</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(selectedService.fy_budget)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" display="block">Calculated Actuals</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">{formatCurrency(selectedService.fy_actuals)}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ height: 500 }}>
                            <DataGrid
                                rows={splits}
                                columns={splitColumns}
                                loading={splitsLoading}
                                density="compact"
                                processRowUpdate={async (newRow) => {
                                    try {
                                        await api.post('/budgets/splits/update', {
                                            service_id: selectedService.id,
                                            entity_id: newRow.entity_id,
                                            month_no: newRow.month_no,
                                            amount: newRow.amount
                                        });
                                        fetchTrackerData(); // Refresh main table to see new FY total
                                        return newRow;
                                    } catch (e) {
                                        showSnackbar('Update failed', 'error');
                                        throw e;
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" onClick={() => setDrawerOpen(false)}>Done</Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default OpexTracker;
