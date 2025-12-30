import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Avatar,
    Tooltip,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    AccountBalance,
    BarChart,
    Settings as SettingsIcon,
    Logout,
    Storage,
    ListAlt,
    TrendingUp,
    ChevronLeft,
    Menu as MenuIcon,
    History
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();

    const isActive = (path) => location.pathname === path;

    // RBAC Permissions Check (Simplified for Sidebar)
    const isVisible = (item) => {
        if (item.adminOnly) {
            return user?.roles?.some(r => (typeof r === 'string' ? r : r.name) === 'Admin');
        }
        if (item.permission) {
            const permissionMatrix = {
                'Admin': ['*'],
                'Editor': ['EDIT_TRACKER', 'VIEW_REPORTS', 'IMPORT_DATA', 'VIEW_POS'],
                'Viewer': ['VIEW_REPORTS', 'VIEW_POS'],
                'Approver': ['APPROVE_CHANGES', 'VIEW_REPORTS'],
            };
            return user?.roles?.some(role => {
                const roleName = typeof role === 'string' ? role : role.name;
                const permissions = permissionMatrix[roleName] || [];
                return permissions.includes('*') || permissions.includes(item.permission);
            });
        }
        return true;
    };

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { label: 'Budget Tracker', path: '/tracker', icon: <TrendingUp />, permission: 'VIEW_REPORTS' },
        { label: 'Purchase Order Details', path: '/variance', icon: <ListAlt />, permission: 'VIEW_REPORTS' },
        { label: 'Actuals Management', path: '/actuals', icon: <ListAlt />, permission: 'VIEW_REPORTS' },
        { label: 'Net Budget', path: '/net-budget', icon: <AccountBalance />, permission: 'VIEW_REPORTS' },
        { label: 'Net Actual', path: '/net-actual', icon: <BarChart />, permission: 'VIEW_REPORTS' },
        { label: 'Allocation Base', path: '/allocation-base', icon: <Storage />, permission: 'VIEW_REPORTS' },
        { label: 'Import History', path: '/imports', icon: <History />, permission: 'VIEW_REPORTS' },
        { label: 'System Logs', path: '/logs', icon: <ListAlt />, permission: 'VIEW_REPORTS' },
        { label: 'Master Data', path: '/master-data', icon: <SettingsIcon />, adminOnly: true },
        { label: 'User Management', path: '/users', icon: <SettingsIcon />, adminOnly: true },
    ];

    const sidebarWidth = collapsed ? '80px' : '260px';

    return (
        <Box
            sx={{
                width: sidebarWidth,
                height: '100vh',
                bgcolor: 'var(--color-slate-900)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRight: '1px solid var(--color-slate-800)',
                zIndex: 1201,
                position: 'relative'
            }}
        >
            {/* Logo Section */}
            <Box sx={{ p: '24px', borderBottom: '1px solid var(--color-slate-800)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
                {!collapsed && (
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center' }}>
                        OPEX <span style={{ color: 'var(--color-blue-400)', marginLeft: '4px' }}>Manager</span>
                    </Typography>
                )}
                <IconButton
                    onClick={() => setCollapsed(!collapsed)}
                    size="small"
                    sx={{ color: 'var(--color-slate-400)', '&:hover': { color: 'white' } }}
                >
                    {collapsed ? <MenuIcon /> : <ChevronLeft />}
                </IconButton>
            </Box>

            {/* Navigation Section */}
            <Box sx={{ flex: 1, py: '24px', px: '12px', overflowY: 'auto', overflowX: 'hidden' }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.filter(isVisible).map((item) => (
                        <Tooltip key={item.path} title={collapsed ? item.label : ""} placement="right">
                            <Box
                                onClick={() => navigate(item.path)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    px: '16px',
                                    py: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    bgcolor: isActive(item.path) ? 'var(--color-blue-600)' : 'transparent',
                                    color: isActive(item.path) ? 'white' : 'var(--color-slate-400)',
                                    '&:hover': {
                                        bgcolor: isActive(item.path) ? 'var(--color-blue-600)' : 'var(--color-slate-800)',
                                        color: 'white'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {React.cloneElement(item.icon, { sx: { fontSize: '20px' } })}
                                </Box>
                                {!collapsed && (
                                    <Typography sx={{ fontWeight: isActive(item.path) ? 600 : 500, fontSize: '14px', whiteSpace: 'nowrap' }}>
                                        {item.label}
                                    </Typography>
                                )}
                            </Box>
                        </Tooltip>
                    ))}
                </nav>
            </Box>

            {/* Bottom Section - User Profile */}
            <Box sx={{ p: '16px', borderTop: '1px solid var(--color-slate-800)' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    p: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'var(--color-slate-800)' }
                }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'var(--color-blue-500)',
                            fontSize: '14px',
                            fontWeight: 700
                        }}
                    >
                        {user?.name?.charAt(0) || 'G'}
                    </Avatar>
                    {!collapsed && (
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'Gagan Admin'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', display: 'block' }}>
                                {user?.roles?.[0] || 'Premium Plan'}
                            </Typography>
                        </Box>
                    )}
                    {!collapsed && (
                        <IconButton size="small" onClick={logout} sx={{ color: 'var(--color-slate-400)' }}>
                            <Logout sx={{ fontSize: '18px' }} />
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
