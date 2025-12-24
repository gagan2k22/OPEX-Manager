import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, TextField, MenuItem, Snackbar, Alert,
    Chip, IconButton, Drawer, Divider
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Visibility, Edit, FileDownload, ListAlt,
    DoubleArrow, ArrowForwardIos, FileUpload,
    CheckCircle, Warning, Info, History,
    TableView, Percent, Settings, Search
} from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
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
    const [viewMode, setViewMode] = useState('amount'); // 'amount' or 'percentage'
    const [auditDialogOpen, setAuditDialogOpen] = useState(false);
    const [auditComment, setAuditComment] = useState('');
    const [pendingUpdate, setPendingUpdate] = useState(null);

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
            day: '2-digit', month: '2-digit', year: '2-digit'
        });
    };

    const getVarianceColor = (budget, actual) => {
        if (!budget || !actual) return 'inherit';
        const diff = budget - actual;
        return diff < 0 ? '#BB0000' : '#107E3E';
    };

    const columns = [
        {
            field: 'fy_year',
            headerName: 'FY',
            width: 50,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'uid',
            headerName: 'UID',
            width: 100,
            cellClassName: 'cell-uid',
            pinned: 'left',
            editable: true
        },
        {
            field: 'vendor',
            headerName: 'Vendor',
            width: 140,
            pinned: 'left',
            editable: true
        },
        {
            field: 'description',
            headerName: 'Service Description',
            width: 180,
            editable: true
        },
        {
            field: 'budget_head',
            headerName: 'Budget Head',
            width: 140,
            type: 'singleSelect',
            valueOptions: budgetHeads,
            editable: true
        },
        {
            field: 'service_start_date',
            headerName: 'Start',
            width: 70,
            valueFormatter: (v) => formatDate(v),
            type: 'date',
            valueGetter: (v) => v ? new Date(v) : null,
            editable: true
        },
        {
            field: 'renewal_month',
            headerName: 'Renewal',
            width: 80,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Calculated: Start + 364 days">
                        <CheckCircle sx={{ fontSize: '10px', color: 'success.main' }} />
                    </Tooltip>
                    {formatDate(params.value)}
                </Box>
            ),
            valueGetter: (value, row) => {
                if (row.service_start_date) {
                    const d = new Date(row.service_start_date);
                    d.setDate(d.getDate() + 364);
                    return d;
                }
                return null;
            }
        },
        {
            field: 'fy_budget',
            headerName: viewMode === 'amount' ? 'Budget Vol' : 'Budget %',
            width: 110,
            type: 'number',
            cellClassName: 'cell-numeric bold-cell',
            editable: true,
            valueFormatter: (value, row) => {
                if (viewMode === 'percentage') {
                    return `${((value / 100000) * 1).toFixed(1)}%`;
                }
                return formatCurrency(value);
            }
        },
        {
            field: 'fy_actuals',
            headerName: 'Actual',
            width: 110,
            type: 'number',
            cellClassName: (params) => {
                const color = getVarianceColor(params.row.fy_budget, params.value);
                return `cell-numeric bold-cell ${color === '#BB0000' ? 'text-error' : 'text-success'}`;
            },
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'variance',
            headerName: 'Var',
            width: 90,
            type: 'number',
            cellClassName: 'cell-numeric',
            valueGetter: (v, row) => (row.fy_budget || 0) - (row.fy_actuals || 0),
            valueFormatter: (value) => formatCurrency(value)
        },
        {
            field: 'po_entity',
            headerName: 'Entity',
            width: 140,
            type: 'singleSelect',
            valueOptions: poEntities,
            editable: true
        },
        {
            field: 'tower',
            headerName: 'Tower',
            width: 90,
            type: 'singleSelect',
            valueOptions: towers,
            editable: true
        },
        {
            field: 'actions',
            headerName: 'Tools',
            width: 100,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Line Item Details">
                        <IconButton size="small" onClick={() => handleViewSplits(params.row)}>
                            <TableView sx={{ fontSize: '14px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Change History">
                        <IconButton size="small">
                            <History sx={{ fontSize: '14px' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
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
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h2" sx={{ fontSize: '14px', fontWeight: 700, color: '#0A6ED1' }}>
                        Monthly OPEX Tracker
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: 1, px: 1, height: 28 }}>
                        <Search sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <input
                            placeholder="Quick Filter..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '11px', width: 120 }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, val) => val && setViewMode(val)}
                        size="small"
                        sx={{ height: 28 }}
                    >
                        <ToggleButton value="amount" sx={{ fontSize: '10px', px: 1.5 }}>
                            <TableView sx={{ fontSize: 14, mr: 0.5 }} /> Amount
                        </ToggleButton>
                        <ToggleButton value="percentage" sx={{ fontSize: '10px', px: 1.5 }}>
                            <Percent sx={{ fontSize: 14, mr: 0.5 }} /> Percent
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Button
                        size="small"
                        variant="outlined"
                        component="label"
                        startIcon={<FileUpload sx={{ fontSize: 14 }} />}
                        disabled={importing}
                        sx={{ fontSize: '10px', height: 28 }}
                    >
                        Import
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                    </Button>

                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<FileDownload sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '10px', height: 28, boxShadow: 'none' }}
                    >
                        Export
                    </Button>
                    <Chip label="FY25" size="small" sx={{ fontSize: '9px', fontWeight: 600, height: 20, bgcolor: 'background.header' }} />
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ flexGrow: 1, overflow: 'hidden', border: '1px solid #D1D5DB', borderRadius: '4px' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    loading={loading}
                    rowCount={totalCount}
                    pageSizeOptions={[50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    density="compact"
                    rowHeight={28}
                    columnHeaderHeight={32}
                    slots={{ toolbar: GridToolbar }}
                    disableRowSelectionOnClick
                    processRowUpdate={async (newRow, oldRow) => {
                        if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
                        setPendingUpdate(newRow);
                        setAuditDialogOpen(true);
                        return oldRow;
                    }}
                    sx={{
                        border: 'none',
                        '& .cell-numeric': {
                            fontFamily: '"Roboto Mono", monospace',
                            textAlign: 'right',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            fontSize: '9px'
                        },
                        '& .cell-uid': {
                            color: '#0A6ED1',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: '#EEF2F6',
                            borderRight: '1px solid #D1D5DB'
                        }
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

            {/* Audit Comment Dialog */}
            <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)}>
                <DialogTitle sx={{ fontSize: '14px', fontWeight: 600 }}>Reason for Change</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, fontSize: '11px', color: 'text.secondary' }}>
                        Enterprise policy requires a reason for all budget modifications.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter rationale (e.g., Contract renegotiated, Scope change...)"
                        value={auditComment}
                        onChange={(e) => setAuditComment(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ '& .MuiInputBase-root': { fontSize: '11px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAuditDialogOpen(false)} size="small" sx={{ fontSize: '11px' }}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            if (!auditComment.trim()) {
                                showSnackbar('Reason is mandatory', 'error');
                                return;
                            }
                            try {
                                await api.put(`/budgets/tracker/${pendingUpdate.id}`, {
                                    ...pendingUpdate,
                                    auditComment: auditComment.trim()
                                });
                                showSnackbar('Record updated with audit trail', 'success');
                                fetchTrackerData();
                                setAuditDialogOpen(false);
                                setAuditComment('');
                            } catch (error) {
                                showSnackbar('Update failed', 'error');
                            }
                        }}
                        variant="contained"
                        size="small"
                        disabled={!auditComment.trim()}
                        sx={{ fontSize: '11px', boxShadow: 'none' }}
                    >
                        Save Change
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ fontSize: '11px' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default OpexTracker;
