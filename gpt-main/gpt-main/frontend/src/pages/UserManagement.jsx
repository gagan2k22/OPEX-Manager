import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Tooltip,
    Card,
    CardContent,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import api from '../utils/api';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import ExportDialog from '../components/ExportDialog';
import * as XLSX from 'xlsx';
import { FileDownload } from '@mui/icons-material';

const ROLE_COLORS = {
    Admin: 'error',
    Approver: 'warning',
    Editor: 'info',
    Viewer: 'default'
};

const PERMISSION_MATRIX = {
    'View dashboards': { Viewer: true, Editor: true, Approver: true, Admin: true },
    'Create / edit line items': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Create / edit POs': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Submit PO for approval': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Approve / reject PO': { Viewer: false, Editor: false, Approver: true, Admin: true },
    'Edit budget BOA': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Approve budget changes': { Viewer: false, Editor: false, Approver: true, Admin: true },
    'Upload actuals': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Manage users & roles': { Viewer: false, Editor: false, Approver: false, Admin: true }
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(['Viewer', 'Editor', 'Approver', 'Admin']);

    // Dialog States
    const [openDialog, setOpenDialog] = useState(false);
    const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: ['Viewer'],
        is_active: true
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Error fetching users', 'error');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles || ['Viewer'],
                is_active: user.is_active
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roles: ['Viewer'],
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const validateForm = () => {
        if (!formData.name || !formData.email) {
            showSnackbar('Name and Email are required', 'error');
            return false;
        }
        if (formData.roles.length === 0) {
            showSnackbar('At least one role is required', 'error');
            return false;
        }
        if (!editingUser && !formData.password) {
            showSnackbar('Password is required for new users', 'error');
            return false;
        }
        if (formData.password && formData.password.length < 8) {
            showSnackbar('Password must be at least 8 characters', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            // Clean up empty password if not set
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            if (editingUser) {
                // Update user
                await api.put(`/users/${editingUser.id}`, payload);
                showSnackbar('User updated successfully', 'success');
            } else {
                // Create user
                await api.post('/users', payload);
                showSnackbar('User created successfully', 'success');
            }

            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error saving user';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/users/${userToDelete.id}`);
            showSnackbar('User deleted successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error deleting user';
            showSnackbar(errorMessage, 'error');
        } finally {
            setOpenDeleteDialog(false);
            setUserToDelete(null);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleExport = (format) => {
        try {
            const exportData = users.map(u => ({
                Name: u.name,
                Email: u.email,
                Roles: u.roles?.join(', '),
                Status: u.is_active ? 'Active' : 'Inactive'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Users');

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const filename = `User_Management_${timestamp}.${extension}`;

            XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
            showSnackbar(`User data exported as ${format.toUpperCase()} successfully!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showSnackbar('Error exporting data', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            await api.put(`/users/${newRow.id}`, newRow);
            setUsers(prev => prev.map(u => u.id === newRow.id ? newRow : u));
            showSnackbar('User updated successfully', 'success');
            return newRow;
        } catch (error) {
            console.error('Update error:', error);
            showSnackbar('Error updating user: ' + (error.message || 'Unknown error'), 'error');
            return oldRow;
        }
    };

    const { searchQuery } = useOutletContext();

    const filteredRows = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
    }, [users, searchQuery]);

    const handleProcessRowUpdateError = (error) => {
        showSnackbar('Error processing update', 'error');
        console.error('Process row update error:', error);
    };

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            {/* Header */}
            <Box sx={pageHeaderStyles}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography sx={pageTitleStyles}>
                            User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage users and their role-based permissions
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={<FileDownload />}
                        onClick={() => setOpenExportDialog(true)}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => setOpenPermissionDialog(true)}
                    >
                        View Permissions Matrix
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Active Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.is_active).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Admins
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.roles?.includes('Admin')).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Approvers
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.roles?.includes('Approver')).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Users Table */}
            <Paper elevation={0} sx={{ width: '100%', height: 500, border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={[
                        {
                            field: 'name',
                            headerName: 'Name',
                            width: 200,
                            editable: true,
                            renderCell: (params) => (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="action" />
                                    <Typography fontWeight="medium">{params.value}</Typography>
                                </Box>
                            )
                        },
                        {
                            field: 'email',
                            headerName: 'Email',
                            width: 250,
                            editable: true
                        },
                        {
                            field: 'roles',
                            headerName: 'Roles',
                            width: 300,
                            renderCell: (params) => (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {params.value?.map((role) => (
                                        <Chip
                                            key={role}
                                            label={role}
                                            size="small"
                                            color={ROLE_COLORS[role] || 'default'}
                                        />
                                    ))}
                                </Box>
                            )
                        },
                        {
                            field: 'is_active',
                            headerName: 'Status',
                            width: 120,
                            renderCell: (params) => (
                                <Switch
                                    checked={params.value}
                                    size="small"
                                    color="success"
                                    disabled={params.row.roles && params.row.roles.includes('Admin')} // Disable for Admins
                                    onClick={(e) => {
                                        e.stopPropagation(); // Avoid row selection
                                    }}
                                    onChange={async (e) => {
                                        const newValue = e.target.checked;
                                        try {
                                            await api.put(`/users/${params.row.id}`, { ...params.row, is_active: newValue });
                                            fetchUsers();
                                            showSnackbar(`User ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
                                        } catch (error) {
                                            showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
                                        }
                                    }}
                                />
                            )
                        },
                        {
                            field: 'actions',
                            headerName: 'Actions',
                            width: 120,
                            type: 'actions',
                            getActions: (params) => {
                                const isAdminUser = params.row.roles && params.row.roles.includes('Admin');
                                return [
                                    <GridActionsCellItem
                                        key="edit"
                                        icon={
                                            <Tooltip title="Edit">
                                                <EditIcon />
                                            </Tooltip>
                                        }
                                        label="Edit"
                                        onClick={() => handleOpenDialog(params.row)}
                                    />,
                                    <GridActionsCellItem
                                        key="delete"
                                        icon={
                                            <Tooltip title={isAdminUser ? "Cannot delete Admin" : "Delete"}>
                                                <DeleteIcon color={isAdminUser ? "disabled" : "action"} />
                                            </Tooltip>
                                        }
                                        label="Delete"
                                        disabled={isAdminUser}
                                        onClick={() => handleDeleteClick(params.row)}
                                        showInMenu={false}
                                    />
                                ];
                            }
                        }
                    ]}
                    getRowId={(row) => row.id}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={handleProcessRowUpdateError}
                    density="compact"
                    slots={{ toolbar: GridToolbar }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#1976d2',
                            color: 'white',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold'
                        }
                    }}
                />
            </Paper>

            {/* Create/Edit User Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <TextField
                            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Roles</InputLabel>
                            <Select
                                multiple
                                value={formData.roles}
                                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                                input={<OutlinedInput label="Roles" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" color={ROLE_COLORS[value]} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Checkbox checked={formData.roles.indexOf(role) > -1} />
                                        <ListItemText primary={role} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user "{userToDelete?.name}" ({userToDelete?.email})?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permission Matrix Dialog */}
            <Dialog open={openPermissionDialog} onClose={() => setOpenPermissionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon />
                        <Typography variant="h6">Role & Permission Matrix</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Module / Action
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Viewer
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Editor
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Approver
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Admin
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(PERMISSION_MATRIX).map(([permission, roleAccess]) => (
                                    <TableRow key={permission} hover>
                                        <TableCell>{permission}</TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Viewer ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Editor ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Approver ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Admin ? '✅' : '❌'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPermissionDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <ExportDialog
                open={openExportDialog}
                onClose={() => setOpenExportDialog(false)}
                onExport={handleExport}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;
