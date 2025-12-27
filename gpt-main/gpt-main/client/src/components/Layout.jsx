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
    useMediaQuery
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

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Operational Overview';
        if (path === '/tracker') return 'Budget tracker';
        if (path === '/net-budget') return 'Annual Summary';
        if (path === '/variance') return 'Purchase Order details';
        if (path.startsWith('/reports')) return 'Financial Reports';
        if (path === '/users') return 'User Management';
        if (path === '/master-data') return 'Master Data';
        return 'OPEX Manager';
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
                        <IconButton size="small" sx={{ color: 'var(--color-slate-500)' }}>
                            <Search />
                        </IconButton>
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
                            onClick={() => navigate('/tracker')} // Default action
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
                        overflowY: 'auto',
                        p: 4,
                        bgcolor: 'var(--color-slate-50)'
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
            <NenoHelper />
        </Box>
    );
};

export default Layout;

