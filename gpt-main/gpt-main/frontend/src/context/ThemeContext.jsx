import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('appThemePreferences');
        return saved ? JSON.parse(saved) : {
            primaryColor: '#003399',
            secondaryColor: '#78BE20',
            backgroundColor: '#F8FAFC',
            fontSize: '14px',
            fontFamily: '"Inter", sans-serif'
        };
    });

    useEffect(() => {
        localStorage.setItem('appThemePreferences', JSON.stringify(theme));
        applyTheme(theme);
    }, [theme]);

    const applyTheme = (t) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', t.primaryColor);
        root.style.setProperty('--secondary-color', t.secondaryColor);
        root.style.setProperty('--bg-color', t.backgroundColor);
        root.style.setProperty('--font-size-base', t.fontSize);
        root.style.setProperty('--font-family-base', t.fontFamily);
    };

    const updateTheme = (newPreferences) => {
        setTheme(prev => ({ ...prev, ...newPreferences }));
    };

    const resetTheme = () => {
        setTheme({
            primaryColor: '#003399',
            secondaryColor: '#78BE20',
            backgroundColor: '#F8FAFC',
            fontSize: '14px',
            fontFamily: '"Inter", sans-serif'
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
