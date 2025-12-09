import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, RadioGroup, FormControlLabel, Radio, Box
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';

const ExportDialog = ({ open, onClose, onExport }) => {
    const [format, setFormat] = React.useState('xlsx');

    const handleExport = () => {
        onExport(format);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Export Data</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Typography width="100%" gutterBottom>
                        Please select the export format:
                    </Typography>
                    <RadioGroup
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <FormControlLabel value="xlsx" control={<Radio />} label="Excel Workbook (.xlsx)" />
                        <FormControlLabel value="csv" control={<Radio />} label="CSV (.csv)" />
                    </RadioGroup>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    startIcon={<FileDownload />}
                    color="primary"
                >
                    Export
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDialog;
