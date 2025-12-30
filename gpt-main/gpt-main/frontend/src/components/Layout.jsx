import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Logout,
    Person,
    NotificationsNone,
    Search
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import NenoHelper from './NenoHelper';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [triggerAddEntry, setTriggerAddEntry] = useState(false);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Operational Overview';
        if (path === '/tracker') return 'Budget Tracker';
        if (path === '/net-budget') return 'Annual Summary';
        if (path === '/variance') return 'Purchase Order Tracker';
        if (path === '/actuals') return 'Actuals Management';
        if (path === '/allocation-base') return 'Allocation Base';
        if (path === '/imports') return 'Import History';
        if (path.startsWith('/reports')) return 'Financial Reports';
        if (path === '/users') return 'User Management';
        if (path === '/master-data') return 'Master Data';
        return 'OPEX Manager';
    };

    const handleNewEntry = () => {
        if (location.pathname === '/tracker') {
            setTriggerAddEntry(true);
        } else {
            navigate('/tracker');
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'var(--color-slate-50)' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <Box
                    component="header"
                    sx={{
                        height: '64px',
                        bgcolor: 'white',
                        borderBottom: '1px solid var(--color-slate-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 4,
                        zIndex: 1100
                    }}
                >
                    <Typography variant="h1" sx={{ fontSize: '20px', color: 'var(--color-slate-800)', fontWeight: 600 }}>
                        {getPageTitle()}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search current page..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                width: '300px',
                                '& .MuiOutlinedInput-root': {
                                    height: '40px',
                                    bgcolor: 'var(--color-slate-50)',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'var(--color-slate-400)', fontSize: '20px' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <IconButton size="small" sx={{ color: 'var(--color-slate-500)' }}>
                            <NotificationsNone />
                        </IconButton>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                bgcolor: 'var(--color-blue-600)',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: 'var(--color-blue-700)', boxShadow: 'none' }
                            }}
                            onClick={handleNewEntry}
                        >
                            + New Entry
                        </Button>
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        overflow: 'hidden', // Zero-scroll at layout level
                        p: 1, // Reduced padding for tighter fit
                        bgcolor: 'var(--color-slate-50)'
                    }}
                >
                    <Outlet context={{ searchQuery, triggerAddEntry, setTriggerAddEntry }} />
                </Box>
            </Box>
            <NenoHelper />
        </Box>
    );
};

export default Layout;

