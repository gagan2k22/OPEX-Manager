import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Alert,
    TextField,
    Tabs,
    Tab
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import ExportDialog from '../components/ExportDialog';
import * as XLSX from 'xlsx';
import { FileDownload } from '@mui/icons-material';

const BudgetBOA = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [editedData, setEditedData] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // 0 = Values, 1 = Percentages
    const { token } = useAuth();
    const inputRefs = useRef({});

    const columns = [
        { id: 'vendor_service', label: 'Vendor / Service', width: '200px', editable: false, sticky: true },
        { id: 'basis_of_allocation', label: 'Basis of Allocation', width: '150px', editable: true },
        { id: 'total_count', label: 'Total Count', width: '100px', editable: true },
        { id: 'jpm_corporate', label: 'JPM Corporate', width: '120px', editable: true },
        { id: 'jphi_corporate', label: 'JPHI Corporate', width: '120px', editable: true },
        { id: 'biosys_bengaluru', label: 'Biosys - Bengaluru', width: '140px', editable: true },
        { id: 'biosys_noida', label: 'Biosys - Noida', width: '130px', editable: true },
        { id: 'biosys_greater_noida', label: 'Biosys - Greater Noida', width: '160px', editable: true },
        { id: 'pharmova_api', label: 'Pharmova - API', width: '130px', editable: true },
        { id: 'jgl_dosage', label: 'JGL - Dosage', width: '120px', editable: true },
        { id: 'jgl_ibp', label: 'JGL - IBP', width: '100px', editable: true },
        { id: 'cadista_dosage', label: 'Cadista - Dosage', width: '140px', editable: true },
        { id: 'jdi_radio_pharmaceuticals', label: 'JDI – Radio Pharmaceuticals', width: '180px', editable: true },
        { id: 'jdi_radiopharmacies', label: 'JDI - Radiopharmacies', width: '160px', editable: true },
        { id: 'jhs_gp_cmo', label: 'JHS GP CMO', width: '120px', editable: true },
        { id: 'jhs_llc_cmo', label: 'JHS LLC - CMO', width: '130px', editable: true },
        { id: 'jhs_llc_allergy', label: 'JHS LLC - Allergy', width: '140px', editable: true },
        { id: 'ingrevia', label: 'Ingrevia', width: '100px', editable: true },
        { id: 'jil_jacpl', label: 'JIL - JACPL', width: '110px', editable: true },
        { id: 'jfl', label: 'JFL', width: '80px', editable: true },
        { id: 'consumer', label: 'Consumer', width: '100px', editable: true },
        { id: 'jti', label: 'JTI', width: '80px', editable: true },
        { id: 'jogpl', label: 'JOGPL', width: '90px', editable: true },
        { id: 'enpro', label: 'Enpro', width: '90px', editable: true },
    ];

    const excelStyles = {
        headerCell: {
            backgroundColor: '#1565c0',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            borderRight: '1px solid #d0d0d0',
            borderBottom: '2px solid #1565c0',
            padding: '4px 8px',
            height: '30px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            whiteSpace: 'nowrap',
        },
        stickyHeaderCell: {
            backgroundColor: '#1565c0',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            borderRight: '2px solid #1565c0',
            borderBottom: '2px solid #1565c0',
            padding: '4px 8px',
            height: '30px',
            position: 'sticky',
            left: 0,
            top: 0,
            zIndex: 11,
            whiteSpace: 'nowrap',
        },
        cell: {
            borderRight: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            padding: '2px 8px',
            fontSize: '11px',
            height: '28px',
            minWidth: '60px',
        },
        stickyCell: {
            position: 'sticky',
            left: 0,
            backgroundColor: '#fff',
            borderRight: '2px solid #1565c0',
            borderBottom: '1px solid #e0e0e0',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 500,
            height: '28px',
            zIndex: 1,
        },
        input: {
            width: '100%',
            fontSize: '11px',
            padding: '2px 4px',
            border: '1px solid #ccc',
            borderRadius: '2px',
            '&:focus': {
                outline: '2px solid #1976d2',
                borderColor: '#1976d2',
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await fetch('/api/budget-boa', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
            setEditedData(JSON.parse(JSON.stringify(result)));
        } catch (err) {
            console.error('Error fetching Budget BOA data:', err);
            setError(err.message || 'Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setEditedData(JSON.parse(JSON.stringify(data)));
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setEditedData(JSON.parse(JSON.stringify(data)));
        setError(null);
    };

    const handleSave = async () => {
        try {
            setError(null);
            const updates = editedData.map(row => ({
                id: row.id,
                ...row
            }));

            for (const update of updates) {
                const response = await fetch(`/api/budget-boa/${update.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(update)
                });

                if (!response.ok) {
                    throw new Error(`Failed to update row ${update.id}`);
                }
            }

            setSuccess('Data saved successfully!');
            setData(editedData);
            setIsEditMode(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save data');
        }
    };

    const handleCellChange = (rowIndex, columnId, value) => {
        const newData = [...editedData];
        newData[rowIndex][columnId] = value;
        setEditedData(newData);
    };

    const handlePaste = (e, rowIndex, columnId) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const rows = pastedData.split('\n').filter(row => row.trim());

        const newData = [...editedData];
        const startColIndex = columns.findIndex(col => col.id === columnId);

        rows.forEach((row, rIdx) => {
            const cells = row.split('\t');
            const targetRowIndex = rowIndex + rIdx;

            if (targetRowIndex < newData.length) {
                cells.forEach((cell, cIdx) => {
                    const targetColIndex = startColIndex + cIdx;
                    if (targetColIndex < columns.length && columns[targetColIndex].editable) {
                        const colId = columns[targetColIndex].id;
                        newData[targetRowIndex][colId] = cell.trim();
                    }
                });
            }
        });

        setEditedData(newData);
    };

    const handleSeed = async () => {
        try {
            const response = await fetch('/api/budget-boa/seed', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to seed data');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const calculatePercentage = (value, total) => {
        if (!total || total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    };

    const handleExport = (format) => {
        try {
            const exportData = data.map(row => {
                const rowData = {};
                columns.forEach(col => {
                    if (activeTab === 1 && col.editable) {
                        rowData[col.label] = `${calculatePercentage(row[col.id], row.total_count)}%`;
                    } else {
                        rowData[col.label] = row[col.id];
                    }
                });
                return rowData;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Budget BOA');

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const filename = `Budget_BOA_${activeTab === 0 ? 'Values' : 'Percentage'}_${timestamp}.${extension}`;

            XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
            setSuccess(`Data exported as ${format.toUpperCase()} successfully!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Error exporting data');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" m={4}><CircularProgress /></Box>;

    const displayData = isEditMode ? editedData : data;

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Budget BOA</Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={<FileDownload />}
                        onClick={() => setOpenExportDialog(true)}
                    >
                        Export
                    </Button>
                    {data.length === 0 && (
                        <Button variant="contained" color="primary" onClick={handleSeed}>
                            Seed Default Data
                        </Button>
                    )}
                    {!isEditMode ? (
                        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
                            Edit Mode
                        </Button>
                    ) : (
                        <>
                            <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            <Paper elevation={2} sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Values" />
                    <Tab label="Percentage Allocation" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper} sx={{ maxHeight: 600, border: '1px solid #d0d0d0' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    sx={col.sticky ? excelStyles.stickyHeaderCell : excelStyles.headerCell}
                                    style={{ width: col.width, minWidth: col.width }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayData.map((row, rowIndex) => (
                            <TableRow key={row.id} hover>
                                {columns.map((col) => (
                                    <TableCell
                                        key={`${row.id}-${col.id}`}
                                        sx={col.sticky ? excelStyles.stickyCell : excelStyles.cell}
                                        style={{ width: col.width, minWidth: col.width }}
                                    >
                                        {isEditMode && col.editable ? (
                                            <TextField
                                                size="small"
                                                value={row[col.id] || ''}
                                                onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)}
                                                onPaste={(e) => handlePaste(e, rowIndex, col.id)}
                                                sx={excelStyles.input}
                                                variant="outlined"
                                            />
                                        ) : activeTab === 1 && col.editable ? (
                                            `${calculatePercentage(row[col.id], row.total_count)}%`
                                        ) : (
                                            row[col.id] || '-'
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {isEditMode && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <strong>Excel Paste Supported:</strong> You can copy data from Excel and paste it directly into the cells.
                    Use Tab or Ctrl+V to paste multiple cells at once.
                </Alert>
            )}

            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
            />
        </Box>
    );
};

export default BudgetBOA;
