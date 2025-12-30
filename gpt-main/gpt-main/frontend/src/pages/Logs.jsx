import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip
} from '@mui/material';
import api from '../utils/api';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';

const Logs = () => {
    const [tabValue, setTabValue] = useState(0);
    const [activityLogs, setActivityLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [activityRes, auditRes] = await Promise.all([
                api.get('/audit/activity'),
                api.get('/audit/audit')
            ]);
            setActivityLogs(activityRes);
            setAuditLogs(auditRes);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleRestore = async (logId) => {
        if (!window.confirm('Are you sure you want to restore this value?')) return;

        try {
            await api.post(`/audit/restore/${logId}`);
            alert('Restored successfully');
            fetchLogs(); // Refresh
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Restore failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>System Logs</Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Activity Logs" />
                    <Tab label="Data Audit Logs" />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            {tabValue === 0 && (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Timestamp</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell>Action</TableCell>
                                            <TableCell>Details</TableCell>
                                            <TableCell>IP Address</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activityLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No activity logs found</TableCell>
                                            </TableRow>
                                        ) : (
                                            activityLogs.map((log) => (
                                                <TableRow key={log.id} hover>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</TableCell>
                                                    <TableCell>{log.username || log.user?.name || 'System'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={log.action} size="small" color={log.action === 'LOGIN' ? 'success' : 'default'} />
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                                                        {log.details || '-'}
                                                    </TableCell>
                                                    <TableCell>{log.ip_address || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </>
                            )}

                            {tabValue === 1 && (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Timestamp</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell>Action</TableCell>
                                            <TableCell>Entity Details</TableCell>
                                            <TableCell>Change</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {auditLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">No data audit logs found</TableCell>
                                            </TableRow>
                                        ) : (
                                            auditLogs.map((log) => (
                                                <TableRow key={log.id} hover>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</TableCell>
                                                    <TableCell>{log.user?.name || 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={log.action} size="small" color="primary" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" display="block">Type: {log.entityType}</Typography>
                                                        <Typography variant="caption" display="block">ID: {log.entityId}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ fontSize: '0.85rem' }}>
                                                            <strong>Field:</strong> {log.field}<br />
                                                            <span style={{ color: 'red', textDecoration: 'line-through' }}>{log.oldValue}</span>
                                                            {' -> '}
                                                            <span style={{ color: 'green' }}>{log.newValue}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label="Restore"
                                                            size="small"
                                                            color="warning"
                                                            clickable
                                                            onClick={() => handleRestore(log.id)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </>
                            )}
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default Logs;
