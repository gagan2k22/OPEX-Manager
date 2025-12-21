import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';
import POLineItemSelector from '../components/POLineItemSelector';

const POForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        poNumber: '',
        poDate: new Date().toISOString().split('T')[0],
        vendorId: '',
        currency: 'INR',
        poValue: '',
        exchangeRate: '1.0',
        prNumber: '',
        prDate: '',
        towerId: '',
        budgetHeadId: '',
        status: 'Draft'
    });

    const [linkedItems, setLinkedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [masters, setMasters] = useState({
        vendors: [],
        towers: [],
        budgetHeads: [],
        currencyRates: []
    });

    // Computed values for summary
    const summary = useMemo(() => {
        const poValue = parseFloat(formData.poValue) || 0;
        const exchangeRate = parseFloat(formData.exchangeRate) || 1;
        const commonCurrencyValue = poValue * exchangeRate;
        const totalAllocated = linkedItems.reduce((sum, item) => sum + (parseFloat(item.allocatedAmount) || 0), 0);
        const unallocated = commonCurrencyValue - totalAllocated;

        return {
            poValue,
            exchangeRate,
            commonCurrencyValue,
            totalAllocated,
            unallocated,
            allocationPercentage: commonCurrencyValue > 0 ? (totalAllocated / commonCurrencyValue) * 100 : 0,
            lineItemCount: linkedItems.length
        };
    }, [formData, linkedItems]);

    // Fetch masters and PO data if edit
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendors, towers, budgetHeads, currencyRates] = await Promise.all([
                    api.get('/master/vendors'),
                    api.get('/master/towers'),
                    api.get('/master/budget-heads'),
                    api.get('/currency-rates')
                ]);

                setMasters({
                    vendors,
                    towers,
                    budgetHeads,
                    currencyRates
                });

                if (isEdit) {
                    const po = await api.get(`/pos/${id}`);
                    setFormData({
                        poNumber: po.poNumber,
                        poDate: po.poDate.split('T')[0],
                        vendorId: po.vendorId || '',
                        currency: po.currency,
                        poValue: po.poValue,
                        exchangeRate: po.exchangeRate || '1.0',
                        prNumber: po.prNumber || '',
                        prDate: po.prDate ? po.prDate.split('T')[0] : '',
                        towerId: po.towerId || '',
                        budgetHeadId: po.budgetHeadId || '',
                        status: po.status
                    });

                    if (po.poLineItems) {
                        setLinkedItems(po.poLineItems.map(link => ({
                            ...link.lineItem,
                            allocatedAmount: link.allocated_amount
                        })));
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setInitialLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, id, isEdit]);

    // Auto-update exchange rate when currency changes
    useEffect(() => {
        if (formData.currency === 'INR') {
            setFormData(prev => ({ ...prev, exchangeRate: '1.0' }));
        } else {
            // Find rate from selected currency to INR
            const rate = masters.currencyRates.find(r =>
                r.from_currency === formData.currency && r.to_currency === 'INR'
            );
            if (rate) {
                setFormData(prev => ({ ...prev, exchangeRate: rate.rate.toString() }));
            } else {
                // Try reverse rate (INR to selected currency)
                const reverseRate = masters.currencyRates.find(r =>
                    r.from_currency === 'INR' && r.to_currency === formData.currency
                );
                if (reverseRate && reverseRate.rate > 0) {
                    // Invert the rate
                    setFormData(prev => ({ ...prev, exchangeRate: (1 / reverseRate.rate).toFixed(4) }));
                }
            }
        }
    }, [formData.currency, masters.currencyRates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                linkedLineItems: linkedItems.map(item => ({
                    id: item.id,
                    allocatedAmount: item.allocatedAmount
                }))
            };

            if (isEdit) {
                await api.put(`/pos/${id}`, payload);
            } else {
                await api.post('/pos', payload);
            }
            navigate('/pos');
        } catch (err) {
            console.error('Error saving PO:', err);
            setError(err.response?.data?.message || 'Failed to save PO');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Draft': 'default',
            'Pending Approval': 'info',
            'Approved': 'success',
            'Rejected': 'error',
            'Closed': 'warning'
        };
        return colors[status] || 'default';
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles, p: 2, minHeight: 'auto' }}>
            <Box sx={{ ...pageHeaderStyles, mb: 2 }}>
                <Typography sx={{ ...pageTitleStyles, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                    {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/pos')}
                        size="small"
                        sx={{ px: 2 }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        form="po-form"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <Save />}
                        size="medium"
                        sx={{
                            px: 4,
                            py: 1,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            background: '#78BE20',
                            color: '#FFFFFF',
                            boxShadow: '0 4px 12px rgba(120, 190, 32, 0.4)',
                            '&:hover': {
                                background: '#A3E635',
                                boxShadow: '0 6px 16px rgba(120, 190, 32, 0.6)',
                                transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                                background: 'rgba(120, 190, 32, 0.3)',
                                color: 'rgba(255, 255, 255, 0.5)',
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isEdit ? '💾 UPDATE PO' : '💾 CREATE PO'}
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form id="po-form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* LEFT SIDE - COMPACT SUMMARY */}
                    <Grid item xs={12} lg={3.5}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#003399', mb: 1.5, fontSize: '0.75rem' }}>
                                SUMMARY
                            </Typography>

                            <Stack spacing={1.5} sx={{ fontSize: '0.7rem' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#B8C5D0', fontSize: '0.7rem' }}>
                                        PO Number
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                        {formData.poNumber || '—'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: '#B8C5D0', fontSize: '0.7rem' }}>
                                        Status
                                    </Typography>
                                    <Box>
                                        <Chip
                                            label={formData.status}
                                            color={getStatusColor(formData.status)}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ borderTop: '1px solid rgba(0, 51, 153, 0.2)', pt: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#B8C5D0', fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                                        Financial
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Value ({formData.currency})
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                                {new Intl.NumberFormat('en-IN').format(summary.poValue)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#78BE20' }}>
                                                INR Value
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#78BE20' }}>
                                                ₹{new Intl.NumberFormat('en-IN').format(summary.commonCurrencyValue.toFixed(0))}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box sx={{ borderTop: '1px solid rgba(0, 51, 153, 0.2)', pt: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#B8C5D0', fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                                        Allocation
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Items
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                                {summary.lineItemCount}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Allocated
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: '#00FF88' }}>
                                                ₹{new Intl.NumberFormat('en-IN').format(summary.totalAllocated.toFixed(0))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Remaining
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    color: summary.unallocated > 0 ? '#FFA726' : '#00FF88'
                                                }}
                                            >
                                                ₹{new Intl.NumberFormat('en-IN').format(summary.unallocated.toFixed(0))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#B8C5D0' }}>
                                                    Progress
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#003399', fontWeight: 600 }}>
                                                    {summary.allocationPercentage.toFixed(0)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                height: 6,
                                                borderRadius: 1,
                                                background: 'rgba(0, 51, 153, 0.1)',
                                                overflow: 'hidden'
                                            }}>
                                                <Box sx={{
                                                    height: '100%',
                                                    width: `${Math.min(summary.allocationPercentage, 100)}%`,
                                                    background: 'linear-gradient(90deg, #003399 0%, #78BE20 100%)',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* RIGHT SIDE - TABLE FORMAT FORM (REORDERED) */}
                    <Grid item xs={12} lg={8.5}>
                        <Stack spacing={2}>
                            {/* 1. LINK LINE ITEMS - FIRST */}
                            <Paper sx={{ p: 2 }}>
                                <POLineItemSelector
                                    selectedItems={linkedItems}
                                    onChange={setLinkedItems}
                                />
                            </Paper>

                            {/* 2. CLASSIFICATION & PR DETAILS - SECOND */}
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                sx={{
                                                    background: '#003399',
                                                    color: '#FFFFFF',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    borderBottom: '2px solid #78BE20',
                                                    py: 1
                                                }}
                                            >
                                                Classification & PR Details
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Tower
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    select
                                                    name="towerId"
                                                    value={formData.towerId}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                >
                                                    <MenuItem value="">Select Tower</MenuItem>
                                                    {masters.towers.map(t => (
                                                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Budget Head
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    select
                                                    name="budgetHeadId"
                                                    value={formData.budgetHeadId}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                >
                                                    <MenuItem value="">Select Budget Head</MenuItem>
                                                    {masters.budgetHeads.map(b => (
                                                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                PR Number
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    name="prNumber"
                                                    value={formData.prNumber}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    placeholder="Optional"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                PR Date
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    name="prDate"
                                                    type="date"
                                                    value={formData.prDate}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* 3. FINANCIAL DETAILS - THIRD */}
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                sx={{
                                                    background: '#003399',
                                                    color: '#FFFFFF',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    borderBottom: '2px solid #78BE20',
                                                    py: 1
                                                }}
                                            >
                                                Financial Details
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Currency
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    select
                                                    name="currency"
                                                    value={formData.currency}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                >
                                                    <MenuItem value="INR">INR</MenuItem>
                                                    <MenuItem value="USD">USD</MenuItem>
                                                    <MenuItem value="EUR">EUR</MenuItem>
                                                    <MenuItem value="GBP">GBP</MenuItem>
                                                    <MenuItem value="CAD">CAD</MenuItem>
                                                </TextField>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                PO Value *
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    name="poValue"
                                                    type="number"
                                                    value={formData.poValue}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    variant="standard"
                                                    inputProps={{ step: '0.01', min: '0' }}
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Exchange Rate (Auto)
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <TextField
                                                    name="exchangeRate"
                                                    type="number"
                                                    value={formData.exchangeRate}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    disabled
                                                    inputProps={{ step: '0.0001', min: '0' }}
                                                    sx={{
                                                        '& .MuiInputBase-input': { fontSize: '0.75rem' },
                                                        '& .Mui-disabled': {
                                                            WebkitTextFillColor: '#78BE20 !important',
                                                            fontWeight: 600
                                                        }
                                                    }}
                                                    helperText={formData.currency !== 'INR' ? 'Auto-fetched from master data' : ''}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* 4. PO DETAILS - FOURTH */}
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                sx={{
                                                    background: '#003399',
                                                    color: '#FFFFFF',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    borderBottom: '2px solid #78BE20',
                                                    py: 1
                                                }}
                                            >
                                                PO Details
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                PO Number *
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    name="poNumber"
                                                    value={formData.poNumber}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    required
                                                    disabled={isEdit}
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, width: '15%', bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                PO Date *
                                            </TableCell>
                                            <TableCell sx={{ width: '35%' }}>
                                                <TextField
                                                    name="poDate"
                                                    type="date"
                                                    value={formData.poDate}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Vendor *
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    name="vendorId"
                                                    value={formData.vendorId}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                >
                                                    <MenuItem value="">Select Vendor</MenuItem>
                                                    {masters.vendors.map(v => (
                                                        <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0, 51, 153, 0.05)', fontSize: '0.7rem' }}>
                                                Status
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                                                >
                                                    <MenuItem value="Draft">Draft</MenuItem>
                                                    <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                                                    <MenuItem value="Approved">Approved</MenuItem>
                                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                                    <MenuItem value="Closed">Closed</MenuItem>
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default POForm;
