@echo off
REM ============================================
REM OPEX Manager - Docker MySQL Quick Setup
REM ============================================

echo.
echo ========================================
echo OPEX Manager - Docker MySQL Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker not found!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo Docker found!
docker --version
echo.

echo This script will:
echo 1. Start MySQL 8.0 in Docker
echo 2. Start phpMyAdmin for database management
echo 3. Create opex_db database
echo 4. Import schema automatically
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/3] Starting MySQL and phpMyAdmin...
docker-compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start Docker containers!
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for MySQL to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo [3/3] Verifying MySQL is running...
docker ps | findstr opex-mysql

echo.
echo ========================================
echo Docker MySQL Setup Complete!
echo ========================================
echo.
echo MySQL is now running!
echo.
echo Connection Details:
echo   Host: localhost
echo   Port: 3306
echo   Database: opex_db
echo   Username: root
echo   Password: opex123
echo.
echo   Alternative User:
echo   Username: opex_user
echo   Password: opex_pass
echo.
echo phpMyAdmin:
echo   URL: http://localhost:8080
echo   Username: root
echo   Password: opex123
echo.
echo Connection String for .env:
echo DATABASE_URL="mysql://root:opex123@localhost:3306/opex_db"
echo.
echo Next steps:
echo 1. Update server/.env with the connection string above
echo 2. Run: migrate-to-mysql.bat
echo.
echo To stop MySQL:
echo   docker-compose down
echo.
echo To view logs:
echo   docker-compose logs -f mysql
echo.
pause
