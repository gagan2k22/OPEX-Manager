import React from 'react';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
                    backdropFilter: 'blur(4px)',
                }}
            >
                <CircularProgress size={60} thickness={4} />
                {message && (
                    <Typography
                        variant="h6"
                        sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}
                    >
                        {message}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                minHeight: 200,
            }}
        >
            <CircularProgress size={40} />
            {message && (
                <Typography
                    variant="body2"
                    sx={{ mt: 2, color: 'text.secondary' }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default Loading;
