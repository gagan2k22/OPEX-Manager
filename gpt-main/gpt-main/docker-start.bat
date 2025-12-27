@echo off
echo ========================================
echo   OPEX Manager - Docker Quick Start
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Stopping any existing containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/5] Removing old volumes (optional - preserves data)...
REM Uncomment the next line to remove volumes and start fresh
REM docker-compose -f docker-compose.dev.yml down -v

echo.
echo [3/5] Building Docker images...
docker-compose -f docker-compose.dev.yml build

echo.
echo [4/5] Starting containers...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [5/5] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Services Status
echo ========================================
docker-compose -f docker-compose.dev.yml ps

echo.
echo ========================================
echo   Application URLs
echo ========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo Redis:    localhost:6379
echo.
echo ========================================
echo   Useful Commands
echo ========================================
echo View logs:        docker-compose -f docker-compose.dev.yml logs -f
echo Stop services:    docker-compose -f docker-compose.dev.yml down
echo Restart services: docker-compose -f docker-compose.dev.yml restart
echo.
echo Opening application in browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to view logs (Ctrl+C to exit)...
pause >nul
docker-compose -f docker-compose.dev.yml logs -f
