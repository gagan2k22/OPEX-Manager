import React, { useState } from 'react';
import { TableCell, IconButton, Popover, TextField, Box, InputAdornment } from '@mui/material';
import { FilterList, Search } from '@mui/icons-material';
import { excelTableStyles } from '../styles/excelTableStyles';

const ColumnFilter = ({
    label,
    value,
    onChange,
    minWidth = '120px',
    type = 'text',
    placeholder = 'Filter...',
    sx = {}
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? `filter-popover-${label}` : undefined;

    const isActive = value && value.length > 0;

    return (
        <TableCell
            sx={{
                ...excelTableStyles.headerCell,
                minWidth,
                position: 'relative',
                pr: 4, // Make space for icon
                bgcolor: isActive ? '#e3f2fd' : 'inherit', // Highlight if active
                ...sx
            }}
        >
            {label}
            <IconButton
                size="small"
                onClick={handleClick}
                sx={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: isActive || open ? 1 : 0.3,
                    '&:hover': { opacity: 1 },
                    color: isActive ? 'primary.main' : 'inherit'
                }}
            >
                <FilterList fontSize="small" />
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2, minWidth: 200 }}>
                    <TextField
                        autoFocus
                        size="small"
                        fullWidth
                        type={type}
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Popover>
        </TableCell>
    );
};

export default ColumnFilter;
