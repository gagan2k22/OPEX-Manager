import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #003399 0%, #1A73E8 50%, #78BE20 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                    animation: 'rotate 20s linear infinite',
                },
                '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Card
                    elevation={8}
                    sx={{
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(0, 51, 153, 0.2)',
                        boxShadow: '0 16px 48px rgba(0, 51, 153, 0.3), 0 0 80px rgba(120, 190, 32, 0.2)',
                        animation: 'float 6s ease-in-out infinite',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 20px 60px rgba(0, 51, 153, 0.4), 0 0 100px rgba(120, 190, 32, 0.3)',
                            transform: 'scale(1.02)',
                        }
                    }}
                >
                    <CardContent sx={{ p: 5 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h1"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    fontWeight: 800,
                                    fontSize: { xs: '2rem', sm: '2.5rem' },
                                    background: 'linear-gradient(135deg, #003399 0%, #1A73E8 50%, #78BE20 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                OPEX MANAGER
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    mb: 1,
                                    fontFamily: '"Poppins", sans-serif',
                                }}
                            >
                                Jubilant Pharma
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#9CA3AF',
                                    opacity: 0.9,
                                }}
                            >
                                Sign in to manage your operational expenses
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    border: '1px solid #DC2626',
                                    color: '#DC2626',
                                    borderRadius: 2,
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                                autoFocus
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 51, 153, 0.3)',
                                            borderWidth: '2px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#003399',
                                            boxShadow: '0 0 8px rgba(0, 51, 153, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#003399',
                                            boxShadow: '0 0 12px rgba(0, 51, 153, 0.5)',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#374151',
                                        '&.Mui-focused': {
                                            color: '#003399',
                                        },
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 51, 153, 0.3)',
                                            borderWidth: '2px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#003399',
                                            boxShadow: '0 0 8px rgba(0, 51, 153, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#003399',
                                            boxShadow: '0 0 12px rgba(0, 51, 153, 0.5)',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#374151',
                                        '&.Mui-focused': {
                                            color: '#003399',
                                        },
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    py: 1.8,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #003399 0%, #1A73E8 100%)',
                                    color: '#FFFFFF',
                                    boxShadow: '0 4px 16px rgba(0, 51, 153, 0.4)',
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
                                        boxShadow: '0 8px 24px rgba(0, 51, 153, 0.6)',
                                        background: 'linear-gradient(135deg, #1A73E8 0%, #003399 100%)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0) scale(0.98)',
                                    },
                                }}
                            >
                                Sign In
                            </Button>
                        </form>

                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 2,
                                background: 'rgba(0, 51, 153, 0.05)',
                                border: '1px solid rgba(0, 51, 153, 0.2)',
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#374151',
                                    display: 'block',
                                    textAlign: 'center',
                                    fontWeight: 500,
                                }}
                            >
                                Demo Credentials
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#003399',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    mt: 0.5,
                                }}
                            >
                                admin@example.com / password123
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
