import { createTheme } from '@mui/material/styles';

// Premium Corporate Dark Theme
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2979FF', // Electric Blue
            light: '#5390FF', // Accents
            dark: '#1565C0',  // Hover states
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00E5FF', // Cyan/Teal
            contrastText: '#000000',
        },
        background: {
            default: '#bdddfc', // Very Light Blue (User specified)
            paper: '#384959',   // Lighter Navy (Cards, Panels)
        },
        text: {
            primary: '#F0F4F8', // Keep primary text light for inside cards
            secondary: '#94A3B8', // Grey for subtitles
        },
        success: {
            main: '#00C853',
        },
        error: {
            main: '#FF3D00',
        },
        warning: {
            main: '#FF9100',
        },
        info: {
            main: '#00B0FF',
        },
        divider: 'rgba(148, 163, 184, 0.2)', // Slightly more visible divider 
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", sans-serif',
        // Global default size reduction
        fontSize: 12,
        // Dark headers for contrast on #bdddfc
        h1: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F0E47', fontSize: '2.5rem' }, // Headers kept large
        h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0F0E47', fontSize: '2rem' },
        h3: { fontWeight: 600, color: '#0F0E47', fontSize: '1.75rem' },
        h4: { fontWeight: 600, color: '#0F0E47', fontSize: '1.5rem' },
        h5: { fontWeight: 600, color: '#0F0E47', fontSize: '1.25rem' },
        h6: { fontWeight: 600, color: '#0F0E47', fontSize: '1rem' },

        // Body text explicitly set to 12px
        body1: { fontSize: '12px', color: '#0F0E47' }, // Explicitly light for card content
        body2: { fontSize: '12px', color: '#0F0E47' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em', fontSize: '12px' },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#2979FF #bdddfc',
                    '&::-webkit-scrollbar': { width: '8px', height: '8px' },
                    '&::-webkit-scrollbar-track': { background: '#bdddfc' },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#2979FF',
                        borderRadius: '4px',
                        '&:hover': { background: '#5390FF' },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontSize: '12px', // Enforce 12px
                    borderRadius: 6, // Slightly tighter radius for smaller font
                    padding: '6px 16px', // Smaller padding
                },
                containedPrimary: {
                    background: '#2979FF', // Solid Electric Blue
                    color: '#ffffff',
                    '&:hover': { background: '#1565C0' }, // Darker Blue hover
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff', // White paper for readability 
                    color: '#0F0E47', // Dark text
                    border: '1px solid #e0e0e0',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#0F0E47', // Requested Dark Header
                    color: '#ffffff',          // White text
                    fontWeight: 700,
                    fontSize: '13px',
                    borderBottom: '2px solid #2979FF',
                    padding: '10px 12px',
                },
                body: {
                    fontSize: '12px', // Table content 12px
                    backgroundColor: '#ffffff', // White rows
                    color: '#0F0E47',           // Dark text
                    borderBottom: '1px solid #eeeeee',
                    padding: '8px 12px',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle striping for contrast
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(41, 121, 255, 0.08) !important', // Hover effect
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0B0E14', // Match Page Background
                    borderBottom: '1px solid #384959',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '12px',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    fontSize: '12px',
                },
                input: {
                    padding: '10px 14px', // Smaller input padding
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: '12px',
                    color: '#0F0E47', // Explicitly dark text
                    '&:hover': {
                        backgroundColor: 'rgba(41, 121, 255, 0.08)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(41, 121, 255, 0.12)',
                        '&:hover': {
                            backgroundColor: 'rgba(41, 121, 255, 0.16)',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
