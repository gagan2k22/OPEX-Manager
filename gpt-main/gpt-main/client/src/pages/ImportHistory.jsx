import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { CheckCircle, Error as ErrorIcon, Schedule } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';

const ImportHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await api.get('/imports');
            setHistory(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching import history:', err);
            setError('Failed to load import history');
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            field: 'createdAt',
            headerName: 'Date',
            width: 180,
            valueFormatter: (value) => new Date(value).toLocaleString()
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace('_', ' ') || 'Unknown'}
                    color={params.value?.includes('MASTER') ? 'primary' : 'secondary'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'filename',
            headerName: 'Filename',
            width: 250
        },
        {
            field: 'user',
            headerName: 'User',
            width: 150,
            valueGetter: (params) => params.row.user?.name || 'Unknown'
        },
        {
            field: 'totalRows',
            headerName: 'Rows',
            width: 100,
            type: 'number',
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'acceptedRows',
            headerName: 'Accepted',
            width: 100,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            cellClassName: 'success-cell'
        },
        {
            field: 'rejectedRows',
            headerName: 'Rejected',
            width: 100,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            cellClassName: (params) => params.value > 0 ? 'error-cell' : ''
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                if (params.value === 'Completed') {
                    return <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />;
                } else if (params.value === 'Failed') {
                    return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />;
                } else {
                    return <Chip icon={<Schedule />} label={params.value} color="default" size="small" />;
                }
            }
        }
    ], []);

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
                    Import History
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ width: '100%', height: 600, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={history}
                    columns={columns}
                    getRowId={(row) => row.id}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] }
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f6f8fa',
                            color: '#24292f',
                            fontWeight: 'bold',
                        },
                        '& .success-cell': {
                            color: 'success.main',
                            fontWeight: 500
                        },
                        '& .error-cell': {
                            color: 'error.main',
                            fontWeight: 700
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default ImportHistory;
