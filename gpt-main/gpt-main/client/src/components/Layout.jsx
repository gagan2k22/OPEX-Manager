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
    const [actualsAnchorEl, setActualsAnchorEl] = useState(null);
    const [masterDataAnchorEl, setMasterDataAnchorEl] = useState(null);
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

    // Navigation Items
    const navItems = [
        {
            label: 'Dashboard',
            path: '/',
            icon: <DashboardIcon />,
            type: 'link'
        },
        {
            label: 'Budgets',
            icon: <AccountBalance />,
            type: 'dropdown',
            anchor: budgetsAnchorEl,
            setAnchor: setBudgetsAnchorEl,
            children: [
                { label: 'Budget', path: '/tracker' },
                { label: 'Net Budget', path: '/net-budget' },
                { label: 'Allocation Base', path: '/allocation-base' }
            ]
        },
        {
            label: 'Actuals',
            icon: <TrendingUp />,
            type: 'dropdown',
            anchor: actualsAnchorEl,
            setAnchor: setActualsAnchorEl,
            children: [
                { label: 'Actual', path: '/actuals' },
                { label: 'Net Actual', path: '/net-actual' }
            ]
        },
        {
            label: 'Purchase Order',
            path: '/pos',
            icon: <ShoppingCart />,
            type: 'link'
        },
        {
            label: 'Master Data',
            icon: <Storage />,
            type: 'dropdown',
            anchor: masterDataAnchorEl,
            setAnchor: setMasterDataAnchorEl,
            children: [
                { label: 'Master Data', path: '/master-data', icon: <Storage /> },
                { label: 'Import History', path: '/imports', icon: <ListAlt /> },
                { label: 'User Management', path: '/users', icon: <SecurityIcon />, adminOnly: true }
            ]
        }
    ];

    const getButtonStyle = (active) => ({
        color: active ? '#FFD700' : '#B8C5D0',
        fontWeight: active ? 700 : 600,
        fontSize: '0.875rem',
        minHeight: '64px', // Full height of navbar
        px: 2,
        borderRadius: 0,
        borderBottom: active ? '3px solid #00D9FF' : '3px solid transparent',
        background: active ? 'linear-gradient(180deg, rgba(255, 215, 0, 0) 0%, rgba(255, 215, 0, 0.1) 100%)' : 'transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            color: '#FFD700',
        }
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
                    borderBottom: '2px solid #FFD700',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', py: 0 }}>
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: 1,
                            mr: 4,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '1.4rem',
                            background: 'linear-gradient(135deg, #FFD700 0%, #00D9FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                        }}
                        onClick={() => navigate('/')}
                    >
                        OPEX MANAGER
                    </Typography>

                    {/* Navigation */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '64px' }}>
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
                                            >
                                                {item.children.map((child, cIdx) => {
                                                    if (child.adminOnly && (!user || !user.roles?.includes('Admin'))) return null;
                                                    return (
                                                        <MenuItem
                                                            key={cIdx}
                                                            onClick={() => handleNavigate(child.path, item.setAnchor)}
                                                            selected={isActive(child.path)}
                                                        >
                                                            {child.icon && <Box component="span" sx={{ mr: 1, display: 'flex' }}>{child.icon}</Box>}
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
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#E8F1F5', fontWeight: 500 }}>
                            {user?.username || 'User'}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen(setUserMenuAnchorEl)}
                            sx={{
                                p: 0.5,
                                '&:hover': { transform: 'scale(1.1)' }
                            }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFD700', color: '#1a1a2e', fontWeight: 700 }}>
                                <Person fontSize="small" />
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={userMenuAnchorEl}
                            open={Boolean(userMenuAnchorEl)}
                            onClose={handleMenuClose(setUserMenuAnchorEl)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem disabled>
                                <Person sx={{ mr: 2 }} />
                                {user?.username}
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => { handleMenuClose(setUserMenuAnchorEl)(); logout(); }}>
                                <Logout sx={{ mr: 2 }} />
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

