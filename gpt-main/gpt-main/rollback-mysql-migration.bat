@echo off
REM ============================================
REM OPEX Manager - Rollback MySQL Migration
REM ============================================

echo.
echo ========================================
echo OPEX Manager - Rollback to SQLite
echo ========================================
echo.

cd /d "%~dp0server"

echo This script will rollback the MySQL migration and restore SQLite.
echo.
echo WARNING: This will restore your previous SQLite database.
echo Any data added after migration will be LOST!
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/4] Restoring Prisma schema...
if exist "prisma\schema.prisma.backup" (
    copy /Y "prisma\schema.prisma.backup" "prisma\schema.prisma"
    echo Schema restored
) else (
    echo ERROR: Backup schema not found!
    pause
    exit /b 1
)

echo.
echo [2/4] Restoring SQLite database...
for %%f in (prisma\dev.db.backup_*) do (
    copy /Y "%%f" "prisma\dev.db"
    echo Database restored from %%f
    goto :db_restored
)

echo WARNING: No database backup found!
echo You may need to recreate the database.

:db_restored

echo.
echo [3/4] Regenerating Prisma Client...
call npx prisma generate

echo.
echo [4/4] Updating .env file...
echo Please update your .env file to use SQLite:
echo DATABASE_URL="file:./dev.db"
echo.
pause

echo.
echo ========================================
echo Rollback Complete!
echo ========================================
echo.
echo Your OPEX Manager is now using SQLite again.
echo.
echo Next steps:
echo 1. Verify .env has SQLite connection string
echo 2. Test the application: npm run dev
echo 3. Verify your data is intact
echo.
pause
