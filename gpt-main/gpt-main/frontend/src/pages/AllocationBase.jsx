import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Divider, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { UploadFile, Download } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AllocationBase = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('Admin');
    const [rows, setRows] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/budgets/import-boa', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Wait for data to refresh before showing success
            await fetchAllocationData();
            alert('Allocation Base updated successfully! Table refreshed.');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload allocation data: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            event.target.value = null; // Reset input
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/budgets/export-boa', { responseType: 'blob' });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const now = new Date();
            const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
            const filename = `Allocation_Base_${timestamp}.xlsx`;

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    useEffect(() => {
        fetchAllocationData();
    }, []);

    const fetchAllocationData = async () => {
        setLoading(true);
        try {
            const data = await api.get('/budgets/boa-allocation');
            setRows(data.rows || []);
            setEntities(data.entities || []);
        } catch (error) {
            console.error('Error fetching allocation data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Smart number formatter: show whole numbers without decimals, decimals with 2 places
    const formatNumber = (value) => {
        if (value === 0 || !value) return '-';
        const num = Number(value);
        // Check if number is a whole number
        if (num % 1 === 0) {
            return num.toString();
        }
        // Has decimal part, show 2 decimal places
        return num.toFixed(2);
    };

    const commonColumns = useMemo(() => [
        { field: 'service_uid', headerName: 'Service', flex: 0.8, minWidth: 100, pinned: 'left' },
        { field: 'basis', headerName: 'Basis of Allocation', flex: 1.2, minWidth: 140, pinned: 'left', editable: isAdmin },
        { field: 'total_count', headerName: 'Total Count', flex: 0.7, minWidth: 90, type: 'number', pinned: 'left', valueFormatter: formatNumber, editable: isAdmin }
    ], [isAdmin]);

    const REQUIRED_ENTITIES = [
        "JPM Corporate", "JPHI Corporate", "Biosys - Bengaluru", "Biosys - Noida",
        "Biosys - Greater Noida", "Pharmova - API", "JGL - Dosage", "JGL - IBP",
        "Cadista - Dosage", "JDI – Radio Pharmaceuticals", "JDI - Radiopharmacies",
        "JHS GP CMO", "JHS LLC - CMO", "JHS LLC - Allergy", "Ingrevia",
        "JIL - JACPL", "JFL", "Consumer", "JTI", "JOGPL", "Enpro"
    ];

    // Filter and sort entities based on requested order, falling back to all entities
    const sortedEntities = useMemo(() => {
        // Start with our hardcoded required entities
        const ordered = [...REQUIRED_ENTITIES];

        // Find any *additional* entities in the API response that aren't in our required list
        // (Just in case new ones are added dynamically in the future)
        const extras = entities.filter(name => !REQUIRED_ENTITIES.includes(name));

        return [...ordered, ...extras];
    }, [entities]);

    // Table 1: Budget BOA Allocation (Absolute Values)
    const table1Columns = useMemo(() => [
        ...commonColumns,
        ...sortedEntities.map(entity => ({
            field: entity,
            headerName: entity,
            flex: 1,
            minWidth: 80,
            type: 'number',
            valueFormatter: formatNumber,
            headerClassName: 'budget-header',
            editable: isAdmin
        }))
    ], [commonColumns, sortedEntities, isAdmin]);

    // Table 2: BOA Allocation Percentage
    const table2Columns = useMemo(() => [
        ...commonColumns,
        ...sortedEntities.map(entity => ({
            field: `pct_${entity}`,
            headerName: entity,
            flex: 1,
            minWidth: 80,
            type: 'number',
            valueFormatter: (value) => {
                if (value === 0 || !value) return '-';
                const num = Number(value);
                // Check if percentage is a whole number
                if (num % 1 === 0) {
                    return `${num}%`;
                }
                return `${num.toFixed(2)}%`;
            },
            headerClassName: 'pct-header'
        }))
    ], [commonColumns, sortedEntities]);

    const { searchQuery } = useOutletContext();

    const filteredRows = useMemo(() => {
        if (!searchQuery) return rows;
        const query = searchQuery.toLowerCase();
        return rows.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
    }, [rows, searchQuery]);

    const gridStyles = {
        border: 'none',
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa',
        },
        '& .budget-header': {
            backgroundColor: '#e3f2fd !important',
        },
        '& .pct-header': {
            backgroundColor: '#f1f8e9 !important',
        },
        '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            fontSize: '11px'
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '11px'
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Use fixed height for tables to ensure visibility of the second table without excessive scrolling
    const tableHeight = '650px';

    return (
        <Box sx={{ ...pageContainerStyles, gap: 3, display: 'flex', flexDirection: 'column', pb: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Allocation Base</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                            disabled={uploading}
                        >
                            Update Allocation Base (XLS)
                            <input
                                type="file"
                                hidden
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Table 1: Budget BOA Allocation */}
            <Box>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 700, color: '#1976d2' }}>
                        Budget BOA Allocation
                    </Typography>
                </Box>
                <Paper variant="outlined" sx={{ height: tableHeight, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={table1Columns}
                        slots={{ toolbar: GridToolbar }}
                        density="compact"
                        sx={gridStyles}
                        processRowUpdate={async (newRow, oldRow) => {
                            if (!isAdmin) return oldRow;
                            try {
                                await api.put(`/budgets/boa-allocation/${newRow.id}`, newRow);
                                // Refresh data to see calculated percentages
                                fetchAllocationData();
                                return newRow;
                            } catch (error) {
                                console.error('Error updating allocation:', error);
                                alert('Update failed: ' + (error.response?.data?.message || error.message));
                                return oldRow;
                            }
                        }}
                        onProcessRowUpdateError={(error) => {
                            console.error('Row update error:', error);
                        }}
                        disableRowSelectionOnClick
                        disableColumnMenu={false}
                        columnBuffer={sortedEntities.length + 3}
                        columnThreshold={sortedEntities.length + 3}
                        hideFooter={true}
                        pageSizeOptions={[]}
                    />
                </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Table 2: BOA Allocation Percentage */}
            <Box>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 700, color: '#2e7d32' }}>
                        BOA Allocation Percentage
                    </Typography>
                </Box>
                <Paper variant="outlined" sx={{ height: tableHeight, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={table2Columns}
                        slots={{ toolbar: GridToolbar }}
                        density="compact"
                        sx={gridStyles}
                        disableRowSelectionOnClick
                        disableColumnMenu={false}
                        columnBuffer={sortedEntities.length + 3}
                        columnThreshold={sortedEntities.length + 3}
                        hideFooter={true}
                        pageSizeOptions={[]}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default AllocationBase;
