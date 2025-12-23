import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles } from '../styles/commonStyles';

const AllocationBase = () => {
    return (
        <Box sx={pageContainerStyles}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>Allocation Base</Typography>
            </Box>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography>Allocation Base Content (Coming Soon)</Typography>
            </Paper>
        </Box>
    );
};

export default AllocationBase;
