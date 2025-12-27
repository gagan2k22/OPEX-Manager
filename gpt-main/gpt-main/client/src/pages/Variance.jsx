import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';

const Variance = () => {
    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Purchase Order Details</Typography>
            </Box>

            <Paper 
                elevation={0} 
                sx={{ 
                    p: 8, 
                    textAlign: 'center',
                    border: '2px dashed #D1D5DB',
                    borderRadius: 2,
                    bgcolor: '#F9FAFB'
                }}
            >
                <Construction sx={{ fontSize: 80, color: '#9CA3AF', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, color: '#374151', fontWeight: 600 }}>
                    Purchase Order Details - Under Construction
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
                    This page is being configured with its own data structure.
                </Typography>
                <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                    <strong>Note:</strong> Each table will have its own data source. 
                    Some cells will be linked from other tables. Configuration in progress.
                </Alert>
            </Paper>
        </Box>
    );
};

export default Variance;
