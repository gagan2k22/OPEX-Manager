@echo off
setlocal
title OPEX Manager - Production Verification

echo ========================================================
echo   OPEX Manager - Production Readiness Verification
echo ========================================================
echo.

echo 1. Checking Environment Configuration...
if exist "server\.env" (
    echo [OK] .env file exists
) else (
    echo [ERROR] .env file missing! Copy server\.env.example to server\.env
)

echo.
echo 2. Checking Dependencies...
cd server
call npm list winston >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Server dependencies installed (winston found)
) else (
    echo [ERROR] Server dependencies missing! Run INSTALL-PRODUCTION-UPDATES.bat
)
cd ..

echo.
echo 3. Checking Frontend Build Config...
if exist "client\vite.config.js" (
    echo [OK] Vite config exists
) else (
    echo [ERROR] Vite config missing!
)

echo.
echo ========================================================
echo   Verification Complete
echo ========================================================
echo.
echo Recommended Next Steps:
echo 1. Open a terminal for Server:
echo    cd server ^& npm run dev
echo.
echo 2. Open a terminal for Client:
echo    cd client ^& npm run dev
echo.
echo 3. Visit http://localhost:5173 and login
echo.
pause
