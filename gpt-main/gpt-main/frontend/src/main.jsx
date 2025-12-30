import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './styles/global.css'


// Axios is configured in src/utils/api.js - prefer using the 'api' instance

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f4f7fc',
            paper: '#ffffff',
        },
    },
    components: {
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f8f9fa',
                        color: '#1a237e',
                        fontWeight: 'bold',
                        borderBottom: '2px solid #1976d2',
                    },
                    '& .MuiDataGrid-cell': {
                        borderColor: '#f0f0f0',
                    },
                    '& .MuiDataGrid-toolbarContainer': {
                        padding: '12px',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff',
                        '& .MuiButton-root': {
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            color: '#1976d2',
                            marginRight: '8px',
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.2rem',
                            }
                        }
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '1px solid #e0e0e0',
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }
            }
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)
