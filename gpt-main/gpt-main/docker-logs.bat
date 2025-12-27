@echo off
echo ========================================
echo   OPEX Manager - View Logs
echo ========================================
echo.
echo Select service to view logs:
echo 1. All services
echo 2. Server only
echo 3. Client only
echo 4. Redis only
echo.
set /p choice=Enter choice (1-4): 

if "%choice%"=="1" (
    docker-compose -f docker-compose.dev.yml logs -f
) else if "%choice%"=="2" (
    docker-compose -f docker-compose.dev.yml logs -f server
) else if "%choice%"=="3" (
    docker-compose -f docker-compose.dev.yml logs -f client
) else if "%choice%"=="4" (
    docker-compose -f docker-compose.dev.yml logs -f redis
) else (
    echo Invalid choice!
    pause
    exit /b 1
)
