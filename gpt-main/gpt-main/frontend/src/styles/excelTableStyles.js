// Premium Corporate Dark Theme - Excel Table Styles
// Matching theme.js settings

export const excelTableStyles = {
    // Container
    tableContainer: {
        width: '100%',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 280px)', // Vertical scroll only
        border: '1px solid rgba(15, 14, 71, 0.2)',
        borderRadius: '6px',
        backgroundColor: '#ffffff', // White container
        '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#bdddfc', // Match page background
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#2979FF',
            borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#1565C0',
        },
    },

    // Table
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        fontSize: '12px',
        fontFamily: '"Inter", "Roboto", sans-serif',
    },

    // Header cells
    headerCell: {
        position: 'sticky',
        top: 0,
        backgroundColor: '#0F0E47', // Dark Navy Header
        borderBottom: '2px solid #2979FF', // Electric Blue highlight
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '10px 12px',
        fontWeight: 700,
        fontSize: '13px',
        color: '#ffffff', // White Text
        textAlign: 'left',
        whiteSpace: 'nowrap',
        zIndex: 10,
        '&:last-child': {
            borderRight: 'none',
        },
    },

    // Filter row cells
    filterCell: {
        position: 'sticky',
        top: '43px', // Adjust based on header height
        backgroundColor: '#0F0E47', // Keep dark for continuity
        borderBottom: '1px solid #2979FF',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px',
        zIndex: 9,
        '&:last-child': {
            borderRight: 'none',
        },
    },

    // Data cells
    dataCell: {
        borderBottom: '1px solid rgba(15, 14, 71, 0.1)',
        borderRight: '1px solid rgba(15, 14, 71, 0.1)',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#0F0E47', // Dark Navy Text
        backgroundColor: '#ffffff', // White Background
        '&:last-child': {
            borderRight: 'none',
        },
    },

    // Row hover effect
    tableRow: {
        '&:hover': {
            backgroundColor: 'rgba(41, 121, 255, 0.08) !important', // Light Blue hover
        },
        '&:nth-of-type(even)': {
            backgroundColor: '#f8f9fa', // Very light grey for striping
        },
    },

    // Filter input
    filterInput: {
        '& .MuiOutlinedInput-root': {
            fontSize: '12px',
            backgroundColor: '#ffffff', // White input
            // Ensure proper box model
            height: '32px',
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
                borderColor: '#2979FF',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#2979FF',
                borderWidth: '1px',
            },
        },
        '& .MuiOutlinedInput-input': {
            padding: '4px 8px', // Tighter padding
            color: '#000000 !important', // Force black text
            '&::placeholder': {
                color: '#666666 !important',
                opacity: 0.8,
            },
        },
    },

    // Numeric cell (right-aligned)
    numericCell: {
        textAlign: 'right',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontWeight: 500,
    },

    // Status chip
    statusChip: {
        fontSize: '11px',
        height: '20px',
        fontWeight: 600,
    },
};
