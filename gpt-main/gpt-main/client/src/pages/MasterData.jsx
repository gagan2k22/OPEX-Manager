import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Paper, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, TextField, Snackbar, Alert, IconButton
} from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Add, CorporateFare, MiscellaneousServices, Delete } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';

const MasterData = () => {
    const [tab, setTab] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({});
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');

    const tabsRows = [
        { label: 'Service & UID Master', endpoint: '/master/services', schema: 'service', fieldName: null },
        { label: 'Budget Heads', endpoint: '/master/budget-heads', schema: 'budget_head', fieldName: 'head_name' },
        { label: 'Towers', endpoint: '/master/towers', schema: 'tower', fieldName: 'tower_name' },
        { label: 'PO Entities', endpoint: '/master/po-entities', schema: 'po_entity', fieldName: 'entity_name' },
        { label: 'Allocation Types', endpoint: '/master/allocation-types', schema: 'allocation_type', fieldName: 'type_name' },
        { label: 'Allocation Basis', endpoint: '/master/allocation-bases', schema: 'allocation_basis', fieldName: 'basis_name' }
    ];

    useEffect(() => {
        fetchData();
    }, [tab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = tabsRows[tab].endpoint;
            const resp = await api.get(endpoint);
            setData(resp);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const current = tabsRows[tab];
            if (formData.id) {
                // Update
                await api.put(`${current.endpoint}/${formData.id}`, formData);
                setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
            } else {
                // Create
                await api.post(current.endpoint, formData);
                setSnackbar({ open: true, message: 'Created successfully', severity: 'success' });
            }
            setOpenDialog(false);
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || error.message || 'Error saving', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            const current = tabsRows[tab];
            await api.delete(`${current.endpoint}/${id}`);
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting', severity: 'error' });
        }
    };

    const columns = [
        ...(tab === 0 ? [
            { field: 'uid', headerName: 'UID', width: 150 },
            { field: 'vendor', headerName: 'Vendor', width: 200 },
            { field: 'service', headerName: 'Service', width: 200 },
            { field: 'budget_head', headerName: 'Budget Head', width: 150 },
            { field: 'tower', headerName: 'Tower', width: 150 }
        ] : []),
        ...(tab === 1 ? [
            { field: 'head_name', headerName: 'Budget Head', flex: 1 },
            { field: 'id', headerName: 'ID', width: 100 }
        ] : []),
        ...(tab === 2 ? [
            { field: 'tower_name', headerName: 'Tower Name', flex: 1 },
            { field: 'id', headerName: 'ID', width: 100 }
        ] : []),
        ...(tab === 3 ? [
            { field: 'entity_name', headerName: 'PO Entity Name', flex: 1 },
            { field: 'id', headerName: 'ID', width: 100 }
        ] : []),
        ...(tab === 4 ? [
            { field: 'type_name', headerName: 'Allocation Type', flex: 1 },
            { field: 'id', headerName: 'ID', width: 100 }
        ] : []),
        ...(tab === 5 ? [
            { field: 'basis_name', headerName: 'Allocation Basis', flex: 1 },
            { field: 'id', headerName: 'ID', width: 100 }
        ] : []),
        ...(isAdmin ? [{
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit color="primary" />}
                    label="Edit"
                    onClick={() => {
                        const current = tabsRows[tab];
                        const displayValue = current.fieldName ? params.row[current.fieldName] : '';
                        setFormData({ ...params.row, name: displayValue });
                        setOpenDialog(true);
                    }}
                />,
                <GridActionsCellItem
                    icon={<Delete color="error" />}
                    label="Delete"
                    onClick={() => handleDelete(params.row.id)}
                />
            ]
        }] : [])
    ];

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Master Data</Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => { setFormData({}); setOpenDialog(true); }}
                    >
                        Add {tabsRows[tab].label.replace(' & UID Master', '').replace('Receiving ', '')}
                    </Button>
                )}
            </Box>

            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
                    {tabsRows.map((t, idx) => <Tab key={idx} label={t.label} />)}
                </Tabs>
            </Paper>

            <Paper elevation={0} sx={{ height: 'calc(100vh - 240px)', border: '1px solid #d0d7de', borderRadius: '8px' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    loading={loading}
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    sx={{ fontSize: '11px', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f6f8fa' } }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{formData.id ? 'Edit' : 'Add'} {tabsRows[tab].label}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {tab === 0 && (
                            <>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth label="UID" value={formData.uid || ''} onChange={(e) => setFormData({ ...formData, uid: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField fullWidth label="Vendor" value={formData.vendor || ''} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Service" value={formData.service || ''} onChange={(e) => setFormData({ ...formData, service: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Budget Head" value={formData.budget_head || ''} onChange={(e) => setFormData({ ...formData, budget_head: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Tower" value={formData.tower || ''} onChange={(e) => setFormData({ ...formData, tower: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Contract" value={formData.contract || ''} onChange={(e) => setFormData({ ...formData, contract: e.target.value })} />
                                </Grid>
                            </>
                        )}
                        {(tab === 1 || tab === 2 || tab === 3 || tab === 4 || tab === 5) && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={
                                        tab === 1 ? 'Budget Head Name' :
                                            tab === 2 ? 'Tower Name' :
                                                tab === 3 ? 'PO Entity Name' :
                                                    tab === 4 ? 'Allocation Type Name' :
                                                        'Allocation Basis Name'
                                    }
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save Record</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default MasterData;
