import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';

const NetActual = () => {
    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Net Actuals</Typography>
            </Box>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography>Net Actuals Content (Coming Soon)</Typography>
            </Paper>
        </Box>
    );
};

export default NetActual;
