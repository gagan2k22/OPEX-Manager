/**
 * API Utility
 * Centralized Axios instance with interceptors and error handling
 */

import axios from 'axios';

// Request deduplication map
const pendingRequests = new Map();

// Create Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // Fixed: Changed from 3000 to 5000 to match backend port
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Injects Authorization header with JWT token and handles request deduplication
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Request deduplication for GET requests
        if (config.method === 'get') {
            const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;

            // If same request is already pending, return the existing promise
            if (pendingRequests.has(requestKey)) {
                const existingRequest = pendingRequests.get(requestKey);
                // Cancel this request and use the existing one
                config.cancelToken = new axios.CancelToken((cancel) => {
                    cancel('Duplicate request cancelled');
                });
                return existingRequest;
            }

            // Store this request
            config.metadata = { requestKey };
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
        // Clean up pending request if it exists
        if (response.config.metadata?.requestKey) {
            pendingRequests.delete(response.config.metadata.requestKey);
        }

        // Return standard response data
        return response.data;
    },
    (error) => {
        // Clean up pending request on error
        if (error.config?.metadata?.requestKey) {
            pendingRequests.delete(error.config.metadata.requestKey);
        }

        // Ignore cancelled duplicate requests
        if (axios.isCancel(error)) {
            return Promise.reject({ message: 'Request cancelled', cancelled: true });
        }

        const errorResponse = {
            message: 'An unexpected error occurred',
            statusCode: 500,
            errors: [],
        };

        if (error.response) {
            // Server responded with error status code
            const { data, status } = error.response;

            errorResponse.statusCode = status;
            errorResponse.message = data.detail || data.message || error.message;
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
