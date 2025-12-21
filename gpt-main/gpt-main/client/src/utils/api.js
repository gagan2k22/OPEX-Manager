/**
 * API Utility
 * Centralized Axios instance with interceptors and error handling
 */

import axios from 'axios';

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Injects Authorization header with JWT token
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles success and error responses globally
 */
api.interceptors.response.use(
    (response) => {
        // Return standard response data
        return response.data;
    },
    (error) => {
        const errorResponse = {
            message: 'An unexpected error occurred',
            statusCode: 500,
            errors: [],
        };

        if (error.response) {
            // Server responded with error status code
            const { data, status } = error.response;

            errorResponse.statusCode = status;
            errorResponse.message = data.message || error.message;
            errorResponse.errors = data.errors || [];

            // Handle Authentication Errors (401)
            if (status === 401) {
                // Clear storage and redirect to login if needed
                // We dispatch a custom event that AuthContext can listen to
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        } else if (error.request) {
            // Request made but no response received (Network Error)
            errorResponse.message = 'Network error. Please check your connection.';
            errorResponse.statusCode = 0;
        } else {
            // Something happened in setting up the request
            errorResponse.message = error.message;
        }

        return Promise.reject(errorResponse);
    }
);

export default api;
