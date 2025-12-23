import React, { useState } from 'react';
import { Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { SmartToy, Send, Close, Minimize } from '@mui/icons-material';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NenoHelper = () => {
    const navigate = useNavigate();
    const { updateTheme, resetTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Neno, your budgeting copilot. I can even change the UI if you ask! How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Add a temporary "thinking" message
        const thinkingId = Date.now() + 1;
        setMessages(prev => [...prev, { id: thinkingId, text: "Let me check that for you...", isBot: true, isThinking: true }]);

        try {
            const response = await api.post('/neno/chat', { message: input });

            // Handle Actions
            if (response.action) {
                const { type, payload, path } = response.action;
                if (type === 'NAVIGATE') {
                    navigate(path);
                } else if (type === 'THEME_UPDATE') {
                    updateTheme(payload);
                } else if (type === 'THEME_RESET') {
                    resetTheme();
                }
            }

            // Remove the thinking message and add the real response
            setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
                id: Date.now() + 2,
                text: response.text,
                isBot: true
            }));
        } catch (error) {
            console.error('Neno Error:', error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
                id: Date.now() + 2,
                text: "I'm sorry, I'm having trouble connecting to my central brain right now. Please try again later.",
                isBot: true
            }));
        }
    };


    if (!open) {
        return (
            <Fab
                color="primary"
                aria-label="neno-helper"
                sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
                onClick={() => setOpen(true)}
            >
                <SmartToy />
            </Fab>
        );
    }

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                bottom: 80,
                right: 20,
                width: 320,
                height: 450,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToy fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">Neno Helper</Typography>
                </Box>
                <Box>
                    <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                        <Minimize />
                    </IconButton>
                </Box>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
                <List dense>
                    {messages.map((msg) => (
                        <ListItem key={msg.id} sx={{ justifyContent: msg.isBot ? 'flex-start' : 'flex-end' }}>
                            <Paper
                                sx={{
                                    p: 1.5,
                                    maxWidth: '80%',
                                    bgcolor: msg.isBot ? 'white' : 'primary.main',
                                    color: msg.isBot ? 'text.primary' : 'white',
                                    borderRadius: '12px',
                                    borderTopLeftRadius: msg.isBot ? 0 : '12px',
                                    borderTopRightRadius: msg.isBot ? '12px' : 0
                                }}
                            >
                                <Typography variant="body2">{msg.text}</Typography>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Ask Neno..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <IconButton color="primary" onClick={handleSend}>
                        <Send />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default NenoHelper;
