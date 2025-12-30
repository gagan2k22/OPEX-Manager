import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Skeleton,
    Card,
    CardContent,
    useTheme
} from '@mui/material';
import {
    AccountBalance,
    BarChart as BarChartIcon,
    TrendingUp,
    TrendingDown,
    Business
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../utils/api';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles,
    metricCardStyles,
    numericTextStyles
} from '../styles/commonStyles';
import { getCurrentFiscalYear } from '../utils/fiscalYearUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const formatCurrencyV2 = (amount) => {
    if (amount === undefined || amount === null) return '-';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return formatCurrency(amount);
};

const Dashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBudget: 0,
        totalActual: 0,
        variance: 0,
        utilizationPercent: 0
    });

    const [towerData, setTowerData] = useState([]);
    const [vendorData, setVendorData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [entities, setEntities] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState('all');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await api.get('/master/po-entities');
                setEntities(data);
            } catch (error) {
                console.error('Error fetching entities:', error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const query = selectedEntity !== 'all' ? `?entityId=${selectedEntity}` : '';
                const data = await api.get(`/reports/dashboard${query}`);
                const { summary, towerWise, vendorWise, monthlyTrend } = data;

                setStats({
                    totalBudget: summary.budget || 0,
                    totalActual: summary.actuals || 0,
                    variance: summary.variance || 0,
                    utilizationPercent: summary.utilization || 0
                });

                setTowerData(towerWise?.map(it => ({ name: it.tower, budget: parseFloat(it.budget) })) || []);
                setVendorData(vendorWise?.slice(0, 10).map(it => ({ name: it.vendor, spend: parseFloat(it.actuals) })) || []);
                setMonthlyTrend(monthlyTrend || []);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedEntity]);

    const metricItems = [
        {
            title: 'Total OPEX Budget',
            value: formatCurrencyV2(stats.totalBudget),
            icon: <AccountBalance sx={{ color: 'var(--color-blue-500)' }} />,
            subtext: `FY ${getCurrentFiscalYear()}`,
            trend: stats.totalBudget > 0 ? 'Projected' : 'N/A'
        },
        {
            title: 'Actual Consumption',
            value: formatCurrencyV2(stats.totalActual),
            icon: <TrendingUp sx={{ color: stats.totalActual > stats.totalBudget ? 'var(--color-red-500)' : 'var(--color-green-500)' }} />,
            subtext: 'Year to Date',
            trend: `${stats.utilizationPercent}% Utilized`
        },
        {
            title: 'Budget Variance',
            value: formatCurrencyV2(stats.variance),
            icon: <BarChartIcon sx={{ color: stats.variance < 0 ? 'var(--color-red-500)' : 'var(--color-green-500)' }} />,
            subtext: stats.variance < 0 ? 'Over Budget' : 'Remaining',
            trend: stats.variance < 0 ? 'Attention Needed' : 'Healthy'
        }
    ];

    if (loading && towerData.length === 0) {
        return (
            <Box sx={pageContainerStyles}>
                <Grid container spacing={3}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography variant="h1" sx={pageTitleStyles}>
                    Dashboard
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="entity-select-label">Entity Filter</InputLabel>
                    <Select
                        labelId="entity-select-label"
                        id="entity-select"
                        value={selectedEntity}
                        label="Entity Filter"
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                    >
                        <MenuItem value="all">All Entities</MenuItem>
                        {entities.map((entity) => (
                            <MenuItem key={entity.id} value={entity.id}>
                                {entity.entity_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} sx={pageTransitionStyles}>
                {/* Metric Cards */}
                {metricItems.map((item, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Paper sx={metricCardStyles}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {item.title}
                                </Typography>
                                {item.icon}
                            </Box>
                            <Typography sx={numericTextStyles}>
                                {item.value}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {item.subtext}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    fontWeight: 700,
                                    color: item.trend === 'Attention Needed' ? 'error.main' : 'success.main'
                                }}>
                                    {item.trend}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}

                {/* Monthly Trend */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ ...metricCardStyles, p: 3, height: 450 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'var(--color-slate-800)' }}>
                            Monthly Spend Trend
                        </Typography>
                        <Box sx={{ height: 350, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B' }}
                                    />
                                    <YAxis
                                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(value), 'Spend']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--color-blue-600)"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: 'var(--color-blue-600)' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        name="Actual Spend"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Tower Distribution */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ ...metricCardStyles, p: 3, height: 450 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'var(--color-slate-800)' }}>
                            Budget by Tower
                        </Typography>
                        <Box sx={{ height: 350, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={towerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="budget"
                                    >
                                        {towerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Vendor Spend */}
                <Grid item xs={12}>
                    <Paper sx={{ ...metricCardStyles, p: 3, height: 450 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'var(--color-slate-800)' }}>
                            Top Vendors (By Actual Spend)
                        </Typography>
                        <Box sx={{ height: 350, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={vendorData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                    />
                                    <YAxis
                                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(value), 'Spend']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="spend" fill="var(--color-blue-500)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
