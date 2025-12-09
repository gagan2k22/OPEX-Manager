import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Button,
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
    Storage
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };

    const handleSettingsNavigate = (path) => {
        navigate(path);
        handleSettingsClose();
    };

    // Main navigation tabs
    const mainTabs = [
        { label: 'Dashboard', path: '/', icon: <DashboardIcon sx={{ mr: 1 }} /> },
        { label: 'Budgets', path: '/budgets', icon: <AccountBalance sx={{ mr: 1 }} /> },
        { label: 'Purchase Orders', path: '/pos', icon: <ShoppingCart sx={{ mr: 1 }} /> },
        { label: 'Actuals', path: '/actuals', icon: <BarChart sx={{ mr: 1 }} /> },
        { label: 'Actual BOA', path: '/actual-boa', icon: <BarChart sx={{ mr: 1 }} /> },
        { label: 'Budget BOA', path: '/budget-boa', icon: <AccountBalance sx={{ mr: 1 }} /> },
        { label: 'Import History', path: '/imports', icon: <Storage sx={{ mr: 1 }} /> },
    ];

    // Get current tab value
    const getCurrentTab = () => {
        const currentPath = location.pathname;
        const tabIndex = mainTabs.findIndex(tab => tab.path === currentPath);
        return tabIndex !== -1 ? tabIndex : false;
    };

    const handleTabChange = (event, newValue) => {
        if (newValue !== false) {
            navigate(mainTabs[newValue].path);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top AppBar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    maxHeight: '64px',
                    minHeight: '64px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
                    borderBottom: '2px solid #FFD700',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', maxHeight: '64px', py: 0 }}>
                    {/* Logo/Brand */}
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
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                filter: 'brightness(1.2)',
                            }
                        }}
                        onClick={() => navigate('/')}
                    >
                        OPEX MANAGER
                    </Typography>

                    {/* Navigation Tabs - Hidden on mobile */}
                    {!isMobile && (
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            <Tabs
                                value={getCurrentTab()}
                                onChange={handleTabChange}
                                textColor="inherit"
                                TabIndicatorProps={{
                                    style: {
                                        backgroundColor: '#00D9FF',
                                        height: 3,
                                        boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
                                    }
                                }}
                                sx={{
                                    minHeight: '48px',
                                    '& .MuiTab-root': {
                                        color: '#B8C5D0',
                                        fontWeight: 600,
                                        minHeight: '48px',
                                        maxHeight: '48px',
                                        py: 0,
                                        fontSize: '0.875rem',
                                        transition: 'all 0.3s ease',
                                        '&.Mui-selected': {
                                            color: '#FFD700',
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 217, 255, 0.15) 100%)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                            color: '#FFD700',
                                            transform: 'translateY(-2px)',
                                        }
                                    }
                                }}
                            >
                                {mainTabs.map((tab, index) => (
                                    <Tab
                                        key={index}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {React.cloneElement(tab.icon, {
                                                    sx: { mr: 0.5, fontSize: '1.1rem' }
                                                })}
                                                {tab.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>

                            {/* Settings Dropdown */}
                            <Button
                                color="inherit"
                                onClick={handleSettingsClick}
                                endIcon={<ArrowDropDown sx={{ fontSize: '1.1rem' }} />}
                                startIcon={<SettingsIcon sx={{ fontSize: '1.1rem' }} />}
                                sx={{
                                    ml: 2,
                                    color: '#B8C5D0',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    minHeight: '48px',
                                    maxHeight: '48px',
                                    py: 0,
                                    px: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                        color: '#FFD700',
                                        transform: 'translateY(-2px)',
                                    },
                                    ...(location.pathname === '/master-data' || location.pathname === '/users' ? {
                                        color: '#FFD700',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 217, 255, 0.15) 100%)',
                                        borderBottom: '3px solid #00D9FF',
                                    } : {}),
                                    borderRadius: 0,
                                }}
                            >
                                Settings
                            </Button>
                            <Menu
                                anchorEl={settingsAnchorEl}
                                open={Boolean(settingsAnchorEl)}
                                onClose={handleSettingsClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem
                                    onClick={() => handleSettingsNavigate('/master-data')}
                                    selected={location.pathname === '/master-data'}
                                >
                                    <Storage sx={{ mr: 2 }} />
                                    Master Data
                                </MenuItem>
                                {user && user.roles && user.roles.includes('Admin') && (
                                    <MenuItem
                                        onClick={() => handleSettingsNavigate('/users')}
                                        selected={location.pathname === '/users'}
                                    >
                                        <SecurityIcon sx={{ mr: 2 }} />
                                        User Management
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    )}

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.875rem', color: '#E8F1F5', fontWeight: 500 }}>
                            {user?.username || 'User'}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{
                                p: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1) rotate(5deg)',
                                }
                            }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFD700', color: '#1a1a2e', fontWeight: 700, boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)' }}>
                                <Person sx={{ fontSize: '1.1rem' }} />
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem disabled>
                                <Person sx={{ mr: 2 }} />
                                {user?.username}
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <Logout sx={{ mr: 2 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    bgcolor: 'background.default',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
