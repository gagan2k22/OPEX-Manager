import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Initialize user from storage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedToken && storedUser) {
            try {
                if (storedUser !== "undefined") {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    localStorage.removeItem('user');
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // Listen for unauthorized events from api interceptor
    useEffect(() => {
        const handleUnauthorized = () => {
            setToken(null);
            setUser(null);
            // Optional: redirect to login or show toast
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = async (email, password) => {
        try {
            // Note: api utility returns response.data directly
            const data = await api.post('/auth/login', { email, password });

            const { token: newToken, user: newUser } = data;

            setToken(newToken);
            setUser(newUser);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
