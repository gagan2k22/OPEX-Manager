@echo off
REM ============================================
REM OPEX Manager - Dependency Update Script
REM Updates dependencies to latest versions
REM ============================================

echo.
echo ========================================
echo  OPEX Manager - Dependency Updates
echo  Updating to Latest Versions
echo ========================================
echo.

REM Check if running in correct directory
if not exist "server\package.json" (
    echo [ERROR] Please run this script from the project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Step 1: Backing up package files...
echo.
copy server\package.json server\package.json.backup >nul 2>&1
copy client\package.json client\package.json.backup >nul 2>&1
if exist "server\package-lock.json" copy server\package-lock.json server\package-lock.json.backup >nul 2>&1
if exist "client\package-lock.json" copy client\package-lock.json client\package-lock.json.backup >nul 2>&1
echo [OK] Backups created

echo.
echo ========================================
echo  Updating Server Dependencies
echo ========================================
echo.

cd server

echo Updating axios to latest...
call npm install axios@latest
if %errorLevel% neq 0 (
    echo [ERROR] Failed to update axios
    goto :restore_backup
)
echo [OK] axios updated

echo.
echo Running security audit...
call npm audit
if %errorLevel% neq 0 (
    echo [WARNING] Security issues found, attempting to fix...
    call npm audit fix
)

echo.
echo Checking for other outdated packages...
call npm outdated

cd ..

echo.
echo ========================================
echo  Updating Client Dependencies
echo ========================================
echo.

cd client

echo Updating axios to latest...
call npm install axios@latest
if %errorLevel% neq 0 (
    echo [ERROR] Failed to update axios
    goto :restore_backup
)
echo [OK] axios updated

echo.
echo Running security audit...
call npm audit
if %errorLevel% neq 0 (
    echo [WARNING] Security issues found, attempting to fix...
    call npm audit fix
)

echo.
echo Checking for other outdated packages...
call npm outdated

cd ..

echo.
echo ========================================
echo  Update Summary
echo ========================================
echo.
echo [OK] Server dependencies updated
echo [OK] Client dependencies updated
echo [OK] Security audits completed
echo.
echo Backups saved:
echo   - server\package.json.backup
echo   - client\package.json.backup
echo.
echo ========================================
echo  Next Steps
echo ========================================
echo.
echo 1. Test the application:
echo    .\start-server.bat
echo.
echo 2. Run full test suite:
echo    cd server
echo    npm test
echo.
echo 3. If everything works:
echo    - Delete backup files
echo    - Commit changes to git
echo.
echo 4. If there are issues:
echo    - Run: restore-dependencies.bat
echo.
pause
exit /b 0

:restore_backup
echo.
echo ========================================
echo  ERROR: Update Failed
echo ========================================
echo.
echo Restoring from backup...
cd ..
copy /Y server\package.json.backup server\package.json >nul 2>&1
copy /Y client\package.json.backup client\package.json >nul 2>&1
if exist "server\package-lock.json.backup" copy /Y server\package-lock.json.backup server\package-lock.json >nul 2>&1
if exist "client\package-lock.json.backup" copy /Y client\package-lock.json.backup client\package-lock.json >nul 2>&1
echo [OK] Restored from backup
echo.
echo Please check the error messages above and try again.
echo.
pause
exit /b 1
