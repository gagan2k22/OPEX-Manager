@echo off
setlocal enabledelayedexpansion

echo Starting OPEX Management System...

REM Check if another instance is already running
tasklist /FI "WINDOWTITLE eq OPEX Server*" 2>NUL | find /I /N "cmd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo.
    echo ==========================================
    echo WARNING: Application is already running!
    echo ==========================================
    echo.
    echo An instance of OPEX Management System is already active.
    echo Please close the existing instance before starting a new one.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo.
echo ==========================================
echo Setting up Server...
echo ==========================================
cd server

if not exist node_modules (
    echo Installing server dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing server dependencies.
        pause
        exit /b
    )
    
    echo Setting up Database...
    call npx prisma generate
    call npx prisma migrate dev --name init
    call node seed.js
) else (
    echo Updating Prisma Client...
    call npx prisma generate
)

echo Starting Backend Server...
start "OPEX Server" cmd /k "npm run dev"

echo.
echo ==========================================
echo Setting up Client...
echo ==========================================
cd ../client

if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing client dependencies.
        pause
        exit /b
    )
)

echo Starting Frontend Client...
start "OPEX Client" cmd /k "npm run dev"

echo.
echo ==========================================
echo Application Started!
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000
echo.
echo If the browser does not open automatically, please visit http://localhost:3000
echo Default Login: admin@example.com / password123
echo ==========================================
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
