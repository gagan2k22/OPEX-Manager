@echo off
echo ========================================
echo  Starting OPEX Manager Server
echo  With Redis Caching Enabled!
echo ========================================
echo.

cd server

echo Checking configuration...
findstr /C:"CACHE_ENABLED=true" .env >nul
if %errorLevel% equ 0 (
    echo [OK] Cache is ENABLED
) else (
    echo [WARNING] Cache may not be enabled
)

echo.
echo Starting server...
echo.
echo Watch for these messages:
echo   - "Connected to Redis for caching" (Redis working)
echo   - "Redis unavailable, switching to in-memory cache" (Fallback mode)
echo.
echo Press Ctrl+C to stop the server
echo.

node src/app.js
