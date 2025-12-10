// Jubilant Theme - Common Styles

export const pageContainerStyles = {
    p: 3,
    backgroundColor: '#F8FAFC',
    minHeight: 'calc(100vh - 64px)',
};

export const pageHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    pb: 2,
    borderBottom: '2px solid #E5E7EB',
};

export const pageTitleStyles = {
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: 1.4,
    color: '#003399',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

export const pageTransitionStyles = {
    animation: 'fadeIn 0.3s ease-in',
    '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
};

export const cardStyles = {
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    p: 3,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
};

export const buttonPrimaryStyles = {
    backgroundColor: '#003399',
    color: '#FFFFFF',
    fontWeight: 500,
    textTransform: 'uppercase',
    '&:hover': {
        backgroundColor: '#1A73E8',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 51, 153, 0.3)',
    },
};

export const buttonSecondaryStyles = {
    backgroundColor: '#78BE20',
    color: '#FFFFFF',
    fontWeight: 500,
    textTransform: 'uppercase',
    '&:hover': {
        backgroundColor: '#A3E635',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(120, 190, 32, 0.3)',
    },
};

export const statusChipStyles = {
    approved: {
        backgroundColor: '#059669',
        color: '#FFFFFF',
        fontWeight: 500,
    },
    pending: {
        backgroundColor: '#F59E0B',
        color: '#1F2937',
        fontWeight: 500,
    },
    rejected: {
        backgroundColor: '#DC2626',
        color: '#FFFFFF',
        fontWeight: 500,
    },
    draft: {
        backgroundColor: '#9CA3AF',
        color: '#FFFFFF',
        fontWeight: 500,
    },
    info: {
        backgroundColor: '#0284C7',
        color: '#FFFFFF',
        fontWeight: 500,
    },
};

export const tableHeaderStyles = {
    backgroundColor: '#003399',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '14px',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    '&:last-child': {
        borderRight: 'none',
    },
};

export const tableRowStyles = {
    '&:hover': {
        backgroundColor: 'rgba(26, 115, 232, 0.08)',
    },
    '&:nth-of-type(even)': {
        backgroundColor: '#F8FAFC',
    },
};

export const dataGridStyles = {
    border: '1px solid #E5E7EB',
    borderRadius: 2,
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
};

export const formFieldStyles = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#9CA3AF',
        },
        '&:hover fieldset': {
            borderColor: '#003399',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#003399',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#374151',
        '&.Mui-focused': {
            color: '#003399',
        },
    },
};

export const alertStyles = {
    success: {
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        color: '#059669',
        border: '1px solid #059669',
    },
    error: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        color: '#DC2626',
        border: '1px solid #DC2626',
    },
    warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#F59E0B',
        border: '1px solid #F59E0B',
    },
    info: {
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        color: '#0284C7',
        border: '1px solid #0284C7',
    },
};

export const metricCardStyles = {
    borderRadius: 2,
    p: 3,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0, 51, 153, 0.15)',
    },
};

export const numericTextStyles = {
    fontFamily: '"Roboto Mono", monospace',
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: 1.4,
    color: '#1F2937',
};
