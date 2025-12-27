@echo off
setlocal

echo [*] Starting OPEX Manager Fast Run...

:: Check if node_modules exist, if not run a quick install
if not exist node_modules (
    echo [!] Root node_modules missing. Installing...
    call npm install --prefer-offline --no-audit --silent
)

if not exist server\node_modules (
    echo [!] Server node_modules missing. Installing...
    cd server && call npm install --prefer-offline --no-audit --silent && cd ..
)

if not exist client\node_modules (
    echo [!] Client node_modules missing. Installing...
    cd client && call npm install --legacy-peer-deps --prefer-offline --no-audit --silent && cd ..
)

:: Ensure Prisma client is generated
if not exist server\node_modules\.prisma (
    echo [!] Prisma client missing. Generating...
    cd server && npx prisma generate && cd ..
)

:: Run development mode
echo [*] Launching Application...
npm run dev

endlocal
