/**
 * frontend/src/utils/formatters.js
 * Centralized formatting utilities
 */

/**
 * Format number as Indian Rupee currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date to Indian locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date and time to Indian locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '';
    }
};

/**
 * Format number with Indian numbering system (lakhs, crores)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Conditional logger - only logs in development
 * @param {...any} args - Arguments to log
 */
export const devLog = (...args) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};

/**
 * Conditional error logger
 * @param {...any} args - Arguments to log
 */
export const devError = (...args) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(...args);
    }
};

/**
 * Conditional warning logger
 * @param {...any} args - Arguments to log
 */
export const devWarn = (...args) => {
    if (process.env.NODE_ENV === 'development') {
        console.warn(...args);
    }
};
