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
    Dashboard as DashboardIcon,
    AccountBalance,
    ShoppingCart,
    BarChart,
    Settings as SettingsIcon,
    Logout,
    Person,
    ArrowDropDown,
    Security as SecurityIcon,
    Storage,
    ListAlt,
    TrendingUp
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NenoHelper from './NenoHelper';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();

    // Menu Anchors
    const [budgetsAnchorEl, setBudgetsAnchorEl] = useState(null);
    const [reportsAnchorEl, setReportsAnchorEl] = useState(null);
    const [adminAnchorEl, setAdminAnchorEl] = useState(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

    // Menu Handlers
    const handleMenuOpen = (setter) => (event) => setter(event.currentTarget);
    const handleMenuClose = (setter) => () => setter(null);
    const handleNavigate = (path, setter) => {
        navigate(path);
        if (setter) setter(null);
    };

    const isActive = (path) => location.pathname === path;
    const isParentActive = (paths) => paths.includes(location.pathname);

    // Navigation Items (Corporate Structure)
    const navItems = [
        { label: 'Dashboard', path: '/', icon: <DashboardIcon />, type: 'link' },
        {
            label: 'Budgets',
            icon: <AccountBalance />,
            type: 'dropdown',
            anchor: budgetsAnchorEl,
            setAnchor: setBudgetsAnchorEl,
            children: [
                { label: 'Monthly Tracker', path: '/tracker' },
                { label: 'Annual Summary', path: '/net-budget' },
                { label: 'Allocation Basis', path: '/allocation-base' }
            ]
        },
        { label: 'Actuals', path: '/actuals', icon: <TrendingUp />, type: 'link' },
        { label: 'Variance', path: '/variance', icon: <BarChart />, type: 'link' },
        {
            label: 'Reports',
            icon: <ListAlt />,
            type: 'dropdown',
            anchor: reportsAnchorEl,
            setAnchor: setReportsAnchorEl,
            children: [
                { label: 'MIS Report', path: '/reports/mis' },
                { label: 'Cost Center View', path: '/reports/cost-center' },
                { label: 'Vendor Analysis', path: '/reports/vendor' }
            ]
        },
        { label: 'Audit Log', path: '/audit-log', icon: <Storage />, type: 'link' },
        {
            label: 'Admin',
            icon: <SettingsIcon />,
            type: 'dropdown',
            anchor: adminAnchorEl,
            setAnchor: setAdminAnchorEl,
            children: [
                { label: 'Master Data', path: '/master-data' },
                { label: 'Import History', path: '/imports' },
                { label: 'User Management', path: '/users', adminOnly: true }
            ]
        }
    ];

    const getButtonStyle = (active) => ({
        color: active ? '#FFFFFF' : '#D1E3F5',
        fontWeight: active ? 600 : 500,
        fontSize: '11px',
        minHeight: '40px', // Corporate compact header
        px: 2,
        borderRadius: 0,
        backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderBottom: active ? '2px solid #FFFFFF' : '2px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#FFFFFF',
        },
        '& .MuiButton-startIcon': { mr: 0.5, '& svg': { fontSize: '16px' } }
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: '#0A6ED1', // Corporate SAP Blue
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '40px !important', px: 2 }}>
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            mr: 3,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#FFFFFF',
                        }}
                        onClick={() => navigate('/')}
                    >
                        OPEX MANAGER
                    </Typography>

                    {/* Navigation */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                            {navItems.map((item, index) => {
                                if (item.type === 'link') {
                                    return (
                                        <Button
                                            key={index}
                                            onClick={() => navigate(item.path)}
                                            startIcon={item.icon}
                                            sx={getButtonStyle(isActive(item.path))}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                } else {
                                    const childPaths = item.children.map(c => c.path);
                                    return (
                                        <Box key={index}>
                                            <Button
                                                onClick={handleMenuOpen(item.setAnchor)}
                                                startIcon={item.icon}
                                                endIcon={<ArrowDropDown />}
                                                sx={getButtonStyle(isParentActive(childPaths))}
                                            >
                                                {item.label}
                                            </Button>
                                            <Menu
                                                anchorEl={item.anchor}
                                                open={Boolean(item.anchor)}
                                                onClose={handleMenuClose(item.setAnchor)}
                                                PaperProps={{
                                                    sx: {
                                                        mt: 0.5,
                                                        minWidth: 160,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        '& .MuiMenuItem-root': {
                                                            fontSize: '11px',
                                                            py: 1
                                                        }
                                                    }
                                                }}
                                            >
                                                {item.children.map((child, cIdx) => {
                                                    if (child.adminOnly && (!user || !user.roles?.includes('Admin'))) return null;
                                                    return (
                                                        <MenuItem
                                                            key={cIdx}
                                                            onClick={() => handleNavigate(child.path, item.setAnchor)}
                                                            selected={isActive(child.path)}
                                                        >
                                                            {child.label}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Menu>
                                        </Box>
                                    );
                                }
                            })}
                        </Box>
                    )}

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#FFFFFF', fontWeight: 500, fontSize: '10px' }}>
                            {user?.name || 'User'}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen(setUserMenuAnchorEl)}
                            sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '10px' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={userMenuAnchorEl}
                            open={Boolean(userMenuAnchorEl)}
                            onClose={handleMenuClose(setUserMenuAnchorEl)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem disabled sx={{ fontSize: '11px' }}>
                                <Person sx={{ mr: 1, fontSize: '16px' }} />
                                {user?.email}
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => { handleMenuClose(setUserMenuAnchorEl)(); logout(); }} sx={{ fontSize: '11px' }}>
                                <Logout sx={{ mr: 1, fontSize: '16px' }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.default' }}>
                <Outlet />
            </Box>
            <NenoHelper />
        </Box>
    );
};

export default Layout;

