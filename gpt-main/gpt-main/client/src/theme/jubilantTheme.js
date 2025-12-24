import { createTheme } from '@mui/material/styles';

// Enterprise-Safe Color Palette (Finance-Friendly)
export const jubilantColors = {
    primary: {
        main: '#0A6ED1',      // SAP Blue
        light: '#E1F0FF',
        dark: '#0052A3',
        contrastText: '#FFFFFF',
    },
    success: {
        main: '#107E3E',      // Corporate Green
        light: '#E7F4E9',
        dark: '#0B592C',
        contrastText: '#FFFFFF',
    },
    warning: {
        main: '#E9730C',      // SAP Orange
        light: '#FFF4E5',
        dark: '#B85A09',
        contrastText: '#FFFFFF',
    },
    error: {
        main: '#BB0000',      // Finance Red
        light: '#FFEBEB',
        dark: '#8B0000',
        contrastText: '#FFFFFF',
    },
    background: {
        default: '#F7F9FB',   // Finance Background
        paper: '#FFFFFF',
        header: '#EEF2F6',    // Table Header Background
    },
    text: {
        primary: '#1C1F21',
        secondary: '#5C6064',
        disabled: '#A0A4A8',
    },
};

export const jubilantTheme = createTheme({
    palette: {
        mode: 'light',
        primary: jubilantColors.primary,
        success: jubilantColors.success,
        warning: jubilantColors.warning,
        error: jubilantColors.error,
        background: jubilantColors.background,
        text: jubilantColors.text,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        // Headers (Enterprise standard: small but bold)
        h1: { fontSize: '14px', fontWeight: 600, color: '#0A6ED1' },
        h2: { fontSize: '12px', fontWeight: 600, color: '#1C1F21' },
        h3: { fontSize: '11px', fontWeight: 600, color: '#1C1F21', textTransform: 'uppercase', letterSpacing: '0.5px' },
        // App Font (Standard)
        body1: { fontSize: '12px', color: '#1C1F21' },
        // Table Text / Small Labels
        body2: { fontSize: '9px', color: '#1C1F21' },
        // Numbers (Roboto Mono)
        h4: {
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '9px',
            fontWeight: 500,
            color: '#1C1F21'
        },
        button: {
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 4, // More corporate, less "bubbly"
    },
    shadows: Array(25).fill('none'), // Very flat design for finance apps
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '6px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                },
                containedPrimary: {
                    background: '#0A6ED1',
                    '&:hover': {
                        background: '#0052A3',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontFamily: '"Inter", sans-serif',
                    padding: '4px 8px',
                    fontSize: '9px',
                    borderBottom: '1px solid #E5E7EB',
                },
                head: {
                    backgroundColor: '#EEF2F6 !important',
                    color: '#1C1F21 !important',
                    fontWeight: 600,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2px',
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#EEF2F6 !important',
                        color: '#1C1F21 !important',
                        fontWeight: 600,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid #D1D5DB',
                    },
                    '& .MuiDataGrid-cell': {
                        fontSize: '9px',
                        borderBottom: '1px solid #F3F4F6',
                    },
                    '& .MuiDataGrid-cell--number': {
                        fontFamily: '"Roboto Mono", monospace',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#F3F7FA',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0A6ED1',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                },
            },
        },
    },
});

// Finance-Friendly Dark Theme
export const jubilantDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#60A5FA' },
        background: { default: '#1C1F21', paper: '#25292D' },
        text: { primary: '#F3F4F6', secondary: '#D1D5DB' },
    },
    typography: jubilantTheme.typography,
    shape: jubilantTheme.shape,
    components: jubilantTheme.components,
});

export default jubilantTheme;
