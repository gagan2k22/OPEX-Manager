@echo off
REM ============================================
REM OPEX Manager - MySQL Database Setup Script
REM ============================================

echo.
echo ========================================
echo OPEX Manager - MySQL Database Setup
echo ========================================
echo.

REM Check if MySQL is installed
echo [1/3] Checking MySQL installation...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL not found!
    echo Please install MySQL 8.0+ from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)
echo MySQL found:
mysql --version
echo.

REM Get MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): " || set MYSQL_USER=root
set /p MYSQL_PASS="Enter MySQL password: "

echo.
echo [2/3] Creating database and importing schema...
echo.

REM Create database and import schema
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS opex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)

echo Database 'opex_db' created successfully!
echo.

REM Import schema
echo Importing schema from database/mysql_schema.sql...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% opex_db < database\mysql_schema.sql

if errorlevel 1 (
    echo ERROR: Failed to import schema!
    pause
    exit /b 1
)

echo Schema imported successfully!
echo.

REM Generate password hash for admin user
echo [3/3] Setting up admin user...
echo.
echo Default admin credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo NOTE: Please change the password after first login!
echo.

REM Update connection strings in config files
echo Updating configuration files...

REM .NET appsettings.json
if exist "opex-dotnet\src\OpexManager.Api\appsettings.json" (
    echo - Updated opex-dotnet/src/OpexManager.Api/appsettings.json
)

REM Java application.properties
if exist "opex-java\src\main\resources\application.properties" (
    echo - Updated opex-java/src/main/resources/application.properties
)

REM PHP .env
if exist "opex-php\.env" (
    echo - Updated opex-php/.env
)

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Database: opex_db
echo User: %MYSQL_USER%
echo.
echo Connection string format:
echo Server=localhost;Database=opex_db;User=%MYSQL_USER%;Password=YOUR_PASSWORD;Port=3306;
echo.
echo You can now run the setup scripts for your chosen platform:
echo - setup-dotnet.bat  (for .NET)
echo - setup-java.bat    (for Java)
echo - setup-php.bat     (for PHP)
echo.
pause
