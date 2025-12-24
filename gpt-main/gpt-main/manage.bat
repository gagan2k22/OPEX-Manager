@echo off
setlocal enabledelayedexpansion

:MENU
cls
echo ============================================================
echo           OPEX Manager - Command Center
echo ============================================================
echo.
echo  1.  Setup Application (Clean Install)
echo  2.  Run Development Mode (Concurrent)
echo  3.  Run Production Mode
echo  4.  Database: Generate Prisma Client
echo  5.  Database: Push Schema Changes (SQLite)
echo  6.  Database: Reset Database (WIPE ALL DATA)
echo  7.  Database: Optimize SQLite
echo  8.  Testing: Run Comprehensive Tests
echo  9.  Exit
echo.
echo ============================================================
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto SETUP
if "%choice%"=="2" goto DEV
if "%choice%"=="3" goto PROD
if "%choice%"=="4" goto PRISMA_GEN
if "%choice%"=="5" goto DB_PUSH
if "%choice%"=="6" goto DB_RESET
if "%choice%"=="7" goto DB_OPT
if "%choice%"=="8" goto TEST
if "%choice%"=="9" goto EXIT
goto MENU

:SETUP
echo.
echo [Setup] Installing all dependencies...
call npm install
echo [Setup] Installing server dependencies...
cd server && call npm install && cd ..
echo [Setup] Installing client dependencies...
cd client && call npm install --legacy-peer-deps && cd ..
echo [Setup] Generating Prisma client...
cd server && npx prisma generate && cd ..
echo [Setup] Initializing database...
cd server && npx prisma db push && cd ..
echo.
echo Setup Complete!
pause
goto MENU

:DEV
echo.
echo [Dev] Starting Application in Development Mode...
call npm run dev
pause
goto MENU

:PROD
echo.
echo [Prod] Starting Application in Production Mode...
cd server && call npm start && cd ..
pause
goto MENU

:PRISMA_GEN
echo.
echo [DB] Generating Prisma client...
cd server && npx prisma generate && cd ..
pause
goto MENU

:DB_PUSH
echo.
echo [DB] Pushing schema changes to SQLite...
cd server && npx prisma db push && cd ..
pause
goto MENU

:DB_RESET
echo.
echo [DB] WARNING: This will wipe all data!
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    cd server && npx prisma migrate reset --force && cd ..
)
pause
goto MENU

:DB_OPT
echo.
echo [DB] Optimizing SQLite database...
cd server
if exist prisma\dev.db (
    echo vacuum; | sqlite3 prisma\dev.db
    echo Database vacuumed.
) else (
    echo Database file not found.
)
cd ..
pause
goto MENU

:TEST
echo.
echo [Test] Running comprehensive test suite...
call npm run test:all
pause
goto MENU

:EXIT
echo Goodbye!
exit /b
