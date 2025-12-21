@echo off
REM ============================================
REM OPEX Manager - Automated MySQL Migration
REM ============================================

echo.
echo ========================================
echo OPEX Manager - MySQL Migration
echo ========================================
echo.

cd /d "%~dp0server"

echo This script will migrate your OPEX Manager from SQLite to MySQL.
echo.
echo Prerequisites:
echo 1. MySQL 8.0+ installed and running
echo 2. Database 'opex_db' created
echo 3. MySQL credentials ready
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/8] Backing up current database...
if exist "prisma\dev.db" (
    copy "prisma\dev.db" "prisma\dev.db.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"
    echo Backup created: dev.db.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%
) else (
    echo No existing database found, skipping backup
)

echo.
echo [2/8] Backing up current schema...
copy "prisma\schema.prisma" "prisma\schema.prisma.backup"
echo Schema backup created

echo.
echo [3/8] Updating Prisma schema to MySQL...
copy "prisma\schema-mysql.prisma" "prisma\schema.prisma"
echo Schema updated

echo.
echo [4/8] Please update your .env file with MySQL connection string
echo.
echo Example:
echo DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/opex_db"
echo.
echo Current .env location: %cd%\.env
echo.
echo Press any key after updating .env file...
pause >nul

echo.
echo [5/8] Installing Prisma MySQL dependencies...
call npm install @prisma/client
call npm install prisma --save-dev

echo.
echo [6/8] Generating Prisma Client...
call npx prisma generate

echo.
echo [7/8] Creating and applying migration...
call npx prisma migrate dev --name init_mysql

if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo.
    echo Troubleshooting:
    echo 1. Check if MySQL is running
    echo 2. Verify database 'opex_db' exists
    echo 3. Check .env DATABASE_URL is correct
    echo 4. Ensure MySQL user has proper permissions
    echo.
    echo To rollback:
    echo 1. copy prisma\schema.prisma.backup prisma\schema.prisma
    echo 2. copy prisma\dev.db.backup_* prisma\dev.db
    echo 3. npx prisma generate
    echo.
    pause
    exit /b 1
)

echo.
echo [8/8] Running database seed...
call npx prisma db seed

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Your OPEX Manager is now using MySQL!
echo.
echo Next steps:
echo 1. Test the application: npm run dev
echo 2. Login at http://localhost:5173
echo 3. Verify all features work
echo 4. Set up MySQL backups
echo.
echo Backup files created:
echo - prisma\dev.db.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%
echo - prisma\schema.prisma.backup
echo.
echo To rollback if needed:
echo 1. Run rollback-mysql-migration.bat
echo.
pause
