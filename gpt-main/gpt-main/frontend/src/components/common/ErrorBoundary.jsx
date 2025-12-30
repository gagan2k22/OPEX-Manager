import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Box, Button, Typography, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 3,
                backgroundColor: 'background.default',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: 3,
                }}
            >
                <Typography variant="h4" color="error" gutterBottom sx={{ fontWeight: 600 }}>
                    Oops! Something went wrong
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    We encountered an unexpected error. Our team has been notified.
                </Typography>

                {process.env.NODE_ENV === 'development' && (
                    <Box
                        sx={{
                            textAlign: 'left',
                            width: '100%',
                            bgcolor: '#f5f5f5',
                            p: 2,
                            borderRadius: 1,
                            mb: 3,
                            overflow: 'auto',
                            maxHeight: 200,
                        }}
                    >
                        <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                            {error.message}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={resetErrorBoundary}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<HomeIcon />}
                        onClick={() => window.location.href = '/'}
                    >
                        Go Home
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

const AppErrorBoundary = ({ children }) => {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset the state of your app so the error doesn't happen again
                window.location.reload();
            }}
            onError={(error, info) => {
                console.error('Uncaught error:', error, info);
                // Log to error reporting service here
            }}
        >
            {children}
        </ReactErrorBoundary>
    );
};

export default AppErrorBoundary;
