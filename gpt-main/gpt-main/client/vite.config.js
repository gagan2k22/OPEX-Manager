import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        // Compress assets for production
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
        }),
    ],
    server: {
        host: true,
        port: 5173, // Standard Vite port, user can change if needed
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: mode === 'development',
        // Production optimizations
        minify: 'esbuild',
        esbuild: {
            drop: mode === 'production' ? ['console', 'debugger'] : [],
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    charts: ['recharts'],
                    utils: ['axios', 'date-fns', 'xlsx'],
                },
            },
        },
    },
}));
