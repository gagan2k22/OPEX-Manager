// Common styles for all pages - Neno Banana Pro AI Theme

export const pageContainerStyles = {
    p: 3,
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: 'transparent',
    '@keyframes slideInUp': {
        from: {
            opacity: 0,
            transform: 'translateY(30px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
    animation: 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const pageHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexWrap: 'wrap',
    gap: 2,
    pb: 2,
    borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
};

export const pageTitleStyles = {
    fontWeight: 800,
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
    background: 'linear-gradient(135deg, #FFD700 0%, #00D9FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.02em',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
    '@keyframes glow': {
        '0%, 100%': {
            filter: 'brightness(1)',
        },
        '50%': {
            filter: 'brightness(1.2)',
        },
    },
    animation: 'glow 3s ease-in-out infinite',
};

export const tableContainerStyles = {
    elevation: 2,
    sx: {
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0 8px 24px rgba(255, 215, 0, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 12px 32px rgba(255, 215, 0, 0.25)',
            transform: 'translateY(-2px)',
        },
        '& .MuiTable-root': {
            minWidth: 650,
        },
    },
};

export const tableHeaderStyles = {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    '& .MuiTableCell-head': {
        color: '#1a1a2e',
        fontWeight: 700,
        fontSize: '0.875rem',
        padding: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #00D9FF',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
};

export const tableRowStyles = {
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(255, 215, 0, 0.08)',
        transform: 'scale(1.001)',
        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
};

export const tableCellStyles = {
    fontSize: '0.875rem',
    padding: '14px 16px',
    color: '#E8F1F5',
    borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
};

export const buttonStyles = {
    primary: {
        variant: 'contained',
        color: 'primary',
        sx: {
            px: 3,
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#1a1a2e',
            boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '0',
                height: '0',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'translate(-50%, -50%)',
                transition: 'width 0.6s, height 0.6s',
            },
            '&:hover::before': {
                width: '300px',
                height: '300px',
            },
            '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(255, 215, 0, 0.5)',
                background: 'linear-gradient(135deg, #FFE44D 0%, #FFB84D 100%)',
            },
            '&:active': {
                transform: 'translateY(0) scale(0.98)',
            },
        },
    },
    secondary: {
        variant: 'outlined',
        color: 'primary',
        sx: {
            px: 3,
            py: 1.2,
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '12px',
            borderWidth: '2px',
            borderColor: '#FFD700',
            color: '#FFD700',
            transition: 'all 0.3s ease',
            '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
            },
        },
    },
};

export const formFieldStyles = {
    fullWidth: true,
    size: 'small',
    sx: {
        '& .MuiInputBase-root': {
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#B8C5D0',
            '&.Mui-focused': {
                color: '#FFD700',
            },
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(255, 215, 0, 0.3)',
                borderWidth: '2px',
            },
            '&:hover fieldset': {
                borderColor: '#FFD700',
                boxShadow: '0 0 8px rgba(255, 215, 0, 0.3)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#FFD700',
                boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
            },
        },
    },
};

export const selectFieldStyles = {
    ...formFieldStyles,
    sx: {
        ...formFieldStyles.sx,
        minWidth: 150,
    },
};

export const cardStyles = {
    elevation: 2,
    sx: {
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.95) 0%, rgba(15, 15, 30, 0.95) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0 8px 24px rgba(255, 215, 0, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 12px 32px rgba(255, 215, 0, 0.3)',
            transform: 'translateY(-4px)',
            borderColor: 'rgba(255, 215, 0, 0.4)',
        },
    },
};

export const chipStyles = {
    draft: {
        label: 'Draft',
        sx: {
            fontWeight: 600,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #666 0%, #888 100%)',
            color: '#fff',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(136, 136, 136, 0.3)',
            },
        },
    },
    submitted: {
        label: 'Submitted',
        sx: {
            fontWeight: 600,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #29B6F6 0%, #0288D1 100%)',
            color: '#fff',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(41, 182, 246, 0.3)',
            },
        },
    },
    approved: {
        label: 'Approved',
        sx: {
            fontWeight: 600,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
            color: '#1a1a2e',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
            },
        },
    },
    rejected: {
        label: 'Rejected',
        sx: {
            fontWeight: 600,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #FF3366 0%, #CC0033 100%)',
            color: '#fff',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(255, 51, 102, 0.3)',
            },
        },
    },
    closed: {
        label: 'Closed',
        sx: {
            fontWeight: 600,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #FFA726 0%, #F57C00 100%)',
            color: '#1a1a2e',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
            },
        },
    },
};

// Page transition styles with enhanced animations
export const pageTransitionStyles = {
    '@keyframes fadeInScale': {
        from: {
            opacity: 0,
            transform: 'translateY(20px) scale(0.95)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
        },
    },
    animation: 'fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Responsive grid styles
export const gridContainerStyles = {
    container: true,
    spacing: 3,
    sx: {
        width: '100%',
        margin: 0,
    },
};

export const gridItemStyles = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
};

// Loading skeleton styles
export const skeletonStyles = {
    variant: 'rectangular',
    animation: 'wave',
    sx: {
        borderRadius: 1,
        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 217, 255, 0.1) 50%, rgba(255, 215, 0, 0.1) 100%)',
    },
};

// Alert/Snackbar styles
export const alertStyles = {
    success: {
        severity: 'success',
        sx: {
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.2) 100%)',
            border: '1px solid #00FF88',
            color: '#00FF88',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
                color: '#00FF88',
            },
        },
    },
    error: {
        severity: 'error',
        sx: {
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.2) 0%, rgba(204, 0, 51, 0.2) 100%)',
            border: '1px solid #FF3366',
            color: '#FF3366',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
                color: '#FF3366',
            },
        },
    },
    warning: {
        severity: 'warning',
        sx: {
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, rgba(255, 167, 38, 0.2) 0%, rgba(245, 124, 0, 0.2) 100%)',
            border: '1px solid #FFA726',
            color: '#FFA726',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
                color: '#FFA726',
            },
        },
    },
    info: {
        severity: 'info',
        sx: {
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, rgba(41, 182, 246, 0.2) 0%, rgba(2, 136, 209, 0.2) 100%)',
            border: '1px solid #29B6F6',
            color: '#29B6F6',
            '& .MuiAlert-icon': {
                fontSize: '1.25rem',
                color: '#29B6F6',
            },
        },
    },
};

// Dialog styles
export const dialogStyles = {
    PaperProps: {
        sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: '500px' },
            background: 'linear-gradient(135deg, #16213e 0%, #0f0f1e 100%)',
            border: '2px solid #FFD700',
            boxShadow: '0 16px 48px rgba(255, 215, 0, 0.3)',
        },
    },
};

export const dialogTitleStyles = {
    sx: {
        fontSize: '1.25rem',
        fontWeight: 700,
        pb: 1,
        color: '#FFD700',
        borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
    },
};

export const dialogContentStyles = {
    sx: {
        pt: 2,
    },
};

export const dialogActionsStyles = {
    sx: {
        px: 3,
        pb: 2,
        gap: 1,
        borderTop: '1px solid rgba(255, 215, 0, 0.2)',
        pt: 2,
    },
};
