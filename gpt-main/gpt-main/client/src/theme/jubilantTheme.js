import { createTheme } from '@mui/material/styles';

// Jubilant Color Palette
export const jubilantColors = {
    // Primary (Brand)
    primary: {
        main: '#003399',      // Jubilant Blue
        light: '#1A73E8',     // Sky Blue
        dark: '#002266',
        contrastText: '#FFFFFF',
    },
    // Secondary (Growth)
    secondary: {
        main: '#78BE20',      // Jubilant Green
        light: '#A3E635',
        dark: '#5A8F18',
        contrastText: '#FFFFFF',
    },
    // Background
    background: {
        default: '#F8FAFC',   // Off White
        paper: '#FFFFFF',     // Card Background
        dark: '#0B132B',      // Deep Navy (Dark Mode)
    },
    // Neutral
    neutral: {
        dark: '#374151',      // Graphite Gray
        medium: '#9CA3AF',    // Cool Gray
        light: '#F8FAFC',
    },
    // Status Colors
    warning: {
        main: '#F59E0B',      // Amber
        light: '#FCD34D',
        dark: '#D97706',
        contrastText: '#1F2937',
    },
    error: {
        main: '#DC2626',      // Crimson
        light: '#F87171',
        dark: '#B91C1C',
        contrastText: '#FFFFFF',
    },
    info: {
        main: '#0284C7',      // Light Blue
        light: '#38BDF8',
        dark: '#0369A1',
        contrastText: '#FFFFFF',
    },
    success: {
        main: '#059669',      // Emerald
        light: '#34D399',
        dark: '#047857',
        contrastText: '#FFFFFF',
    },
    // Text
    text: {
        primary: '#1F2937',
        secondary: '#374151',
        disabled: '#9CA3AF',
    },
};

// Chart Colors
export const jubilantChartColors = ['#003399', '#1A73E8', '#78BE20', '#F59E0B', '#9CA3AF'];

// Create Light Theme
export const jubilantTheme = createTheme({
    palette: {
        mode: 'light',
        primary: jubilantColors.primary,
        secondary: jubilantColors.secondary,
        background: jubilantColors.background,
        warning: jubilantColors.warning,
        error: jubilantColors.error,
        info: jubilantColors.info,
        success: jubilantColors.success,
        text: jubilantColors.text,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        // Logo / Brand Name
        h1: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            lineHeight: 1.3,
            textTransform: 'uppercase',
            color: '#003399',
        },
        // Page Title
        h2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: 1.4,
            color: '#1F2937',
        },
        // Section Headings
        h3: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: 1.5,
            color: '#374151',
        },
        // Body Text
        body1: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#1F2937',
        },
        // Small Text / Labels
        body2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#374151',
        },
        // Numeric Data
        h4: {
            fontFamily: '"Roboto Mono", monospace',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: 1.4,
            color: '#1F2937',
        },
        // Buttons / CTAs
        button: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: 1.3,
            textTransform: 'uppercase',
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0 2px 8px rgba(0,0,0,0.08)',
        '0 4px 12px rgba(0,0,0,0.10)',
        '0 6px 16px rgba(0,0,0,0.12)',
        '0 8px 20px rgba(0,0,0,0.14)',
        '0 10px 24px rgba(0,0,0,0.16)',
        '0 12px 28px rgba(0,0,0,0.18)',
        '0 14px 32px rgba(0,0,0,0.20)',
        '0 16px 36px rgba(0,0,0,0.22)',
        '0 18px 40px rgba(0,0,0,0.24)',
        '0 20px 44px rgba(0,0,0,0.26)',
        '0 22px 48px rgba(0,0,0,0.28)',
        '0 24px 52px rgba(0,0,0,0.30)',
        '0 26px 56px rgba(0,0,0,0.32)',
        '0 28px 60px rgba(0,0,0,0.34)',
        '0 30px 64px rgba(0,0,0,0.36)',
        '0 32px 68px rgba(0,0,0,0.38)',
        '0 34px 72px rgba(0,0,0,0.40)',
        '0 36px 76px rgba(0,0,0,0.42)',
        '0 38px 80px rgba(0,0,0,0.44)',
        '0 40px 84px rgba(0,0,0,0.46)',
        '0 42px 88px rgba(0,0,0,0.48)',
        '0 44px 92px rgba(0,0,0,0.50)',
        '0 46px 96px rgba(0,0,0,0.52)',
        '0 48px 100px rgba(0,0,0,0.54)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                },
                contained: {
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease',
                    },
                },
                containedPrimary: {
                    background: '#003399',
                    '&:hover': {
                        background: '#1A73E8',
                    },
                },
                containedSecondary: {
                    background: '#78BE20',
                    '&:hover': {
                        background: '#A3E635',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: 24,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
                colorSuccess: {
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                },
                colorWarning: {
                    backgroundColor: '#F59E0B',
                    color: '#1F2937',
                },
                colorError: {
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                },
                colorInfo: {
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#003399',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '14px',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(26, 115, 232, 0.08)',
                    },
                    '&:nth-of-type(even)': {
                        backgroundColor: '#F8FAFC',
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#003399',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '14px',
                    },
                    '& .MuiDataGrid-cell': {
                        borderRight: '1px solid #E5E7EB',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(26, 115, 232, 0.08)',
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: '#F8FAFC',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#003399',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#FFFFFF',
                    borderRight: '1px solid #E5E7EB',
                },
            },
        },
    },
});

// Create Dark Theme
export const jubilantDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1A73E8',
            light: '#60A5FA',
            dark: '#003399',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#A3E635',
            light: '#BEF264',
            dark: '#78BE20',
            contrastText: '#1F2937',
        },
        background: {
            default: '#0B132B',
            paper: '#1E293B',
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#E2E8F0',
            disabled: '#64748B',
        },
        warning: jubilantColors.warning,
        error: jubilantColors.error,
        info: jubilantColors.info,
        success: jubilantColors.success,
    },
    typography: jubilantTheme.typography,
    shape: jubilantTheme.shape,
    shadows: jubilantTheme.shadows,
    components: {
        ...jubilantTheme.components,
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#1A73E8',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '14px',
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: '1px solid #334155',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1A73E8',
                        color: '#FFFFFF',
                    },
                    '& .MuiDataGrid-cell': {
                        borderRight: '1px solid #334155',
                    },
                },
            },
        },
    },
});

export default jubilantTheme;
