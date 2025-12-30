import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Divider,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const APP_FIELDS = [
    { value: 'uid', label: 'UID (Unique ID)' },
    { value: 'parentUid', label: 'Parent UID' },
    { value: 'description', label: 'Service Description' },
    { value: 'tower', label: 'Tower' },
    { value: 'budgetHead', label: 'Budget Head' },
    { value: 'vendor', label: 'Vendor Name' },
    { value: 'startDate', label: 'Start Date' },
    { value: 'endDate', label: 'End Date' },
    { value: 'renewalDate', label: 'Renewal Date' },
    { value: 'contractId', label: 'Contract/PO ID' },
    { value: 'poEntity', label: 'PO Entity' },
    { value: 'allocationBasis', label: 'Allocation Basis' },
    { value: 'allocationType', label: 'Allocation Type' },
    { value: 'serviceType', label: 'Service Type' },
    { value: 'initiativeType', label: 'Initiative Type' },
    { value: 'priority', label: 'Priority' },
    { value: 'total', label: 'Total Budget' },
    { value: 'month_Apr', label: 'April' },
    { value: 'month_May', label: 'May' },
    { value: 'month_Jun', label: 'June' },
    { value: 'month_Jul', label: 'July' },
    { value: 'month_Aug', label: 'August' },
    { value: 'month_Sep', label: 'September' },
    { value: 'month_Oct', label: 'October' },
    { value: 'month_Nov', label: 'November' },
    { value: 'month_Dec', label: 'December' },
    { value: 'month_Jan', label: 'January' },
    { value: 'month_Feb', label: 'February' },
    { value: 'month_Mar', label: 'March' }
];

const ImportModal = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dryRunResult, setDryRunResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [customMapping, setCustomMapping] = useState({});

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setDryRunResult(null);
            setError(null);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setDryRunResult(null);
            setError(null);
        }
    };

    const handleDryRun = async (mapping = customMapping) => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('dryRun', 'true');
            formData.append('customMapping', JSON.stringify(mapping));

            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/budgets/import`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setDryRunResult(response.data);
            if (activeStep === 0 || activeStep === 1) {
                // Initialize mapping from dry run result if not yet set
                if (Object.keys(mapping).length === 0 && response.data.headerMapping?.fieldMap) {
                    setCustomMapping(response.data.headerMapping.fieldMap);
                }
                setActiveStep(prev => prev + 1);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing file');
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('dryRun', 'false');
            formData.append('customMapping', JSON.stringify(customMapping));

            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/budgets/import`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess(response.data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error importing data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadRejected = () => {
        if (!dryRunResult?.report?.rejected) return;

        const csvContent = [
            ['Row', 'UID', 'Errors'].join(','),
            ...dryRunResult.report.rejected.map(row =>
                [row.rowIndex, row.uid || 'N/A', row.errors.join('; ')].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rejected_rows.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setFile(null);
        setDryRunResult(null);
        setError(null);
        setActiveStep(0);
        setCustomMapping({});
        onClose();
    };

    const handleMappingChange = (header, appField) => {
        setCustomMapping(prev => ({
            ...prev,
            [header]: appField
        }));
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Import Budget Data</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    <Step><StepLabel>Upload</StepLabel></Step>
                    <Step><StepLabel>Field Mapping</StepLabel></Step>
                    <Step><StepLabel>Preview</StepLabel></Step>
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Step 0: File Upload Area */}
                {activeStep === 0 && (
                    <Box
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        sx={{
                            border: '2px dashed',
                            borderColor: file ? 'primary.main' : 'grey.300',
                            borderRadius: 2,
                            p: 6,
                            textAlign: 'center',
                            backgroundColor: file ? 'primary.50' : 'grey.50',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'primary.50'
                            }
                        }}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                            <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {file ? file.name : 'Drop Excel file here or click to browse'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please upload the budget Excel file with header row.
                            </Typography>
                            {file && (
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                                    File selected: {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                            )}
                        </label>
                    </Box>
                )}

                {/* Step 1: Field Mapping */}
                {activeStep === 1 && dryRunResult && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Map Excel Headers to Application Fields
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            We detected the following headers in your Excel file. Please verify or adjust the mapping.
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Excel Header</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Application Field</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dryRunResult.headerMapping.rawHeaders.map((header, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell>
                                                <Typography variant="body2">{header}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={customMapping[header] || ''}
                                                        onChange={(e) => handleMappingChange(header, e.target.value)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="">
                                                            <em>Skip this column</em>
                                                        </MenuItem>
                                                        <Divider />
                                                        {APP_FIELDS.map((field) => (
                                                            <MenuItem key={field.value} value={field.value}>
                                                                {field.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                {customMapping[header] ? (
                                                    <CheckIcon color="success" fontSize="small" />
                                                ) : (
                                                    <Tooltip title="This column will be ignored">
                                                        <ErrorIcon color="action" fontSize="small" />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Step 2: Preview Results */}
                {activeStep === 2 && dryRunResult && (
                    <Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                                    <Typography variant="caption" color="text.secondary">Total Rows</Typography>
                                    <Typography variant="h5">{dryRunResult.report.totalRows}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                                    <Typography variant="caption" color="success.main">Accepted</Typography>
                                    <Typography variant="h5" color="success.main">{dryRunResult.report.accepted.length}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                                    <Typography variant="caption" color="error.main">Rejected</Typography>
                                    <Typography variant="h5" color="error.main">{dryRunResult.report.rejected.length}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Rejected Rows */}
                        {dryRunResult.report.rejected.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle2" color="error" fontWeight="bold">
                                        Rejected Rows (Review requested)
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownloadRejected}
                                        color="error"
                                    >
                                        Download All Errors
                                    </Button>
                                </Box>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Row</TableCell>
                                                <TableCell>UID</TableCell>
                                                <TableCell>Errors</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dryRunResult.report.rejected.slice(0, 10).map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{row.rowIndex}</TableCell>
                                                    <TableCell>{row.uid || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {row.errors.map((err, i) => (
                                                            <Chip key={i} label={err} size="small" color="error" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                                                        ))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {/* Accepted Rows Preview */}
                        {dryRunResult.report.accepted.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                                    Summary of Accepted Rows
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>UID</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell>Vendor</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dryRunResult.report.accepted.slice(0, 5).map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{row.uid}</TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {row.description}
                                                    </TableCell>
                                                    <TableCell align="right">{row.totalBudget?.toLocaleString()}</TableCell>
                                                    <TableCell>{row.vendor || '-'}</TableCell>
                                                    <TableCell>
                                                        <Chip label="OK" size="small" color="success" variant="outlined" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>

                {activeStep > 0 && (
                    <Button
                        disabled={loading}
                        onClick={() => setActiveStep(prev => prev - 1)}
                        variant="outlined"
                    >
                        Back
                    </Button>
                )}

                {activeStep === 0 && (
                    <Button
                        variant="contained"
                        onClick={() => handleDryRun({})}
                        disabled={!file || loading}
                        startIcon={<CheckIcon />}
                    >
                        Initialize Mapping
                    </Button>
                )}

                {activeStep === 1 && (
                    <Button
                        variant="contained"
                        onClick={() => handleDryRun(customMapping)}
                        disabled={loading}
                        startIcon={<CheckIcon />}
                    >
                        Update Preview
                    </Button>
                )}

                {activeStep === 2 && (
                    <Button
                        variant="contained"
                        onClick={handleCommit}
                        disabled={loading || dryRunResult.report.accepted.length === 0}
                        startIcon={<UploadIcon />}
                        color="success"
                    >
                        Commit Import ({dryRunResult.report.accepted.length} rows)
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ImportModal;
