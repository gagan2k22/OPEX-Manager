@echo off
REM ============================================
REM OPEX Manager - Restore Dependencies
REM Restores dependencies from backup
REM ============================================

echo.
echo ========================================
echo  OPEX Manager - Restore Dependencies
echo  Restoring from Backup
echo ========================================
echo.

if not exist "server\package.json.backup" (
    echo [ERROR] No backup found for server/package.json
    echo Please ensure you ran update-dependencies.bat first
    pause
    exit /b 1
)

if not exist "client\package.json.backup" (
    echo [ERROR] No backup found for client/package.json
    echo Please ensure you ran update-dependencies.bat first
    pause
    exit /b 1
)

echo Restoring server dependencies...
copy /Y server\package.json.backup server\package.json >nul 2>&1
if exist "server\package-lock.json.backup" copy /Y server\package-lock.json.backup server\package-lock.json >nul 2>&1
echo [OK] Server dependencies restored

echo.
echo Restoring client dependencies...
copy /Y client\package.json.backup client\package.json >nul 2>&1
if exist "client\package-lock.json.backup" copy /Y client\package-lock.json.backup client\package-lock.json >nul 2>&1
echo [OK] Client dependencies restored

echo.
echo Reinstalling dependencies...
echo.

echo Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo ========================================
echo  Restore Complete
echo ========================================
echo.
echo Dependencies have been restored to previous versions.
echo.
echo Next steps:
echo 1. Test the application
echo 2. If working, you can delete the backup files
echo.
pause
