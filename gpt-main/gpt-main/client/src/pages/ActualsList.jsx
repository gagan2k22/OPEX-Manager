import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, MenuItem, Select, InputLabel,
    FormControl, OutlinedInput, Chip, FormHelperText, Button
} from '@mui/material';
import axios from 'axios';
import { CloudUpload, FileDownload } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    tableContainerStyles,
    tableHeaderStyles,
    tableRowStyles,
    tableCellStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import { getAvailableFiscalYears, getFiscalYearMonths } from '../utils/fiscalYearUtils';
import ExportDialog from '../components/ExportDialog';
import ActualsImportModal from '../components/ActualsImportModal';
import { useAuth } from '../context/AuthContext'; // Assuming context usage for token

const ActualsList = () => {
    const [actuals, setActuals] = useState([]);
    const [selectedFiscalYears, setSelectedFiscalYears] = useState([2025]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [allFiscalMonths, setAllFiscalMonths] = useState([]);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const fiscalYears = getAvailableFiscalYears();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Update available months based on selected fiscal years
    useEffect(() => {
        if (selectedFiscalYears.length > 0) {
            // Flatten months from all selected years
            const months = selectedFiscalYears.flatMap(year =>
                getFiscalYearMonths(year).map(m => ({
                    ...m,
                    uniqueId: `${year}-${m.value}`, // Unique ID for key
                    label: `${m.label} ${year}`
                }))
            );
            setAllFiscalMonths(months);
        } else {
            setAllFiscalMonths([]);
        }
    }, [selectedFiscalYears]);

    const fetchActuals = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            // Handle multiple fiscal years
            selectedFiscalYears.forEach(fy => params.append('fiscal_year', fy));

            // Handle multiple months (sending month numbers)
            selectedMonths.forEach(m => params.append('month', m));

            // If selectedMonths is empty, should we send all? Controller might handle empty as all.
            // But if we have multiple years, we might want all months of those years.

            const response = await axios.get(`/api/actuals?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActuals(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching actuals:', error);
            setLoading(false);
        }
    }, [selectedFiscalYears, selectedMonths]);

    // Initial Load and Filter Change
    useEffect(() => {
        fetchActuals();
    }, [fetchActuals]);

    const handleFiscalYearChange = (event) => {
        const { target: { value } } = event;
        const val = typeof value === 'string' ? value.split(',') : value;
        setSelectedFiscalYears(val);
        // Clear months if years change to avoid invalid months
        setSelectedMonths([]);
    };

    const handleMonthChange = (event) => {
        const { target: { value } } = event;
        setSelectedMonths(typeof value === 'string' ? value.split(',') : value);
    };

    const handleExport = (format) => {
        try {
            const exportData = actuals.map(actual => ({
                'FY': actual.fiscal_year,
                'Month': monthNames[actual.month - 1] || actual.month,
                'Tower': actual.tower?.name,
                'Budget Head': actual.budget_head?.name,
                'Cost Centre': actual.cost_centre?.code,
                'Actual Amount': actual.actual_amount,
                'Remarks': actual.remarks || '-'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Actuals');

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const filename = `Actuals_${timestamp}.${extension}`;

            XLSX.writeFile(wb, filename);
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    Actuals Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={() => setImportModalOpen(true)}
                    >
                        Import Actuals
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={() => setOpenExportDialog(true)}
                        color="success"
                    >
                        Export
                    </Button>

                    {/* Multi-select Fiscal Year */}
                    <FormControl sx={{ minWidth: 250 }} size="small">
                        <InputLabel id="fiscal-year-multi-select-label">Fiscal Years</InputLabel>
                        <Select
                            labelId="fiscal-year-multi-select-label"
                            id="fiscal-year-multi-select"
                            multiple
                            value={selectedFiscalYears}
                            onChange={handleFiscalYearChange}
                            input={<OutlinedInput label="Fiscal Years" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const fy = fiscalYears.find(f => f.value === value);
                                        return <Chip key={value} label={fy?.label || value} size="small" />;
                                    })}
                                </Box>
                            )}
                        >
                            {fiscalYears.map((fy) => (
                                <MenuItem key={fy.value} value={fy.value}>
                                    {fy.label} ({fy.range})
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select one or more fiscal years</FormHelperText>
                    </FormControl>

                    {/* Multi-select Months */}
                    <FormControl sx={{ minWidth: 300 }} size="small">
                        <InputLabel id="month-multi-select-label">Months</InputLabel>
                        <Select
                            labelId="month-multi-select-label"
                            id="month-multi-select"
                            multiple
                            value={selectedMonths}
                            onChange={handleMonthChange}
                            input={<OutlinedInput label="Months" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.length === 0 ? (
                                        <em>All Months</em>
                                    ) : (
                                        selected.map((value) => (
                                            <Chip key={value} label={monthNames[value - 1]} size="small" />
                                        ))
                                    )}
                                </Box>
                            )}
                            disabled={selectedFiscalYears.length === 0}
                        >
                            {allFiscalMonths.map((month) => (
                                <MenuItem key={month.uniqueId} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {selectedFiscalYears.length === 0
                                ? 'Select fiscal year(s) first'
                                : 'Select one or more months (leave empty for all)'}
                        </FormHelperText>
                    </FormControl>
                </Box>
            </Box>

            <TableContainer component={Paper} {...tableContainerStyles}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ ...tableHeaderStyles, backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>FY</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Month</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Tower</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Budget Head</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Cost Centre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Actual Amount (₹)</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actuals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {loading ? 'Loading...' : 'No actuals data found for the selected period'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            actuals.map((actual) => (
                                <TableRow key={actual.id} sx={tableRowStyles}>
                                    <TableCell sx={tableCellStyles}>{actual.fiscal_year}</TableCell>
                                    <TableCell sx={tableCellStyles}>{monthNames[actual.month - 1]}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.tower?.name}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.budget_head?.name}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.cost_centre?.code}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.actual_amount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.remarks || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <ExportDialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} onExport={handleExport} />
            <ActualsImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchActuals}
            />
        </Box>
    );
};

export default ActualsList;
