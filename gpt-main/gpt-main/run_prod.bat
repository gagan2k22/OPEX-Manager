@echo off
echo Starting OPEX Management System (Production Mode)...
echo ===================================================

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    pause
    exit /b
)

echo.
echo [1/3] Preparing Database...
cd server
call npx prisma generate
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo Error: Database migration failed.
    echo attempting to fix by generating client...
    call npx prisma generate
)

echo.
echo [2/3] Starting Backend Server...
echo server running in production mode on port 5000...
start "OPEX Backend (Production)" cmd /k "set NODE_ENV=production&& npm start"

echo.
echo [3/3] Starting Frontend Client...
cd ../client
echo Serving production build on port 3000...
start "OPEX Frontend (Production)" cmd /k "npm run preview -- --port 3000 --host"

echo.
echo ===================================================
echo System Running!
echo - Backend API: http://localhost:5000
echo - Frontend UI: http://localhost:3000
echo.
echo Login with: admin@example.com / password123
echo ===================================================
pause
