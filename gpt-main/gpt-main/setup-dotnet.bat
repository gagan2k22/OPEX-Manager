@echo off
REM ============================================
REM OPEX Manager - .NET Quick Setup Script
REM ============================================

echo.
echo ========================================
echo OPEX Manager - .NET Setup
echo ========================================
echo.

REM Check if .NET SDK is installed
echo [1/8] Checking .NET SDK...
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK not found!
    echo Please install .NET 8.0 SDK from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo .NET SDK found: 
dotnet --version
echo.

REM Navigate to opex-dotnet directory
cd /d "%~dp0opex-dotnet"

REM Create solution if it doesn't exist
if not exist "OpexManager.sln" (
    echo [2/8] Creating solution...
    dotnet new sln -n OpexManager
    
    echo [3/8] Creating projects...
    dotnet new webapi -n OpexManager.Api -o src/OpexManager.Api --force
    dotnet new classlib -n OpexManager.Core -o src/OpexManager.Core --force
    dotnet new classlib -n OpexManager.Infrastructure -o src/OpexManager.Infrastructure --force
    dotnet new classlib -n OpexManager.Services -o src/OpexManager.Services --force
    
    echo [4/8] Adding projects to solution...
    dotnet sln add src/OpexManager.Api/OpexManager.Api.csproj
    dotnet sln add src/OpexManager.Core/OpexManager.Core.csproj
    dotnet sln add src/OpexManager.Infrastructure/OpexManager.Infrastructure.csproj
    dotnet sln add src/OpexManager.Services/OpexManager.Services.csproj
    
    echo [5/8] Adding project references...
    dotnet add src/OpexManager.Api reference src/OpexManager.Core
    dotnet add src/OpexManager.Api reference src/OpexManager.Infrastructure
    dotnet add src/OpexManager.Api reference src/OpexManager.Services
    dotnet add src/OpexManager.Infrastructure reference src/OpexManager.Core
    dotnet add src/OpexManager.Services reference src/OpexManager.Core
) else (
    echo [2-5/8] Solution already exists, skipping creation...
)

echo.
echo [6/8] Installing NuGet packages...
cd src\OpexManager.Api
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
dotnet add package Serilog.AspNetCore --version 8.0.0
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection --version 12.0.1

cd ..\OpexManager.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.0
dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0

cd ..\OpexManager.Services
dotnet add package BCrypt.Net-Next --version 4.0.3
dotnet add package System.IdentityModel.Tokens.Jwt --version 7.0.3
dotnet add package ClosedXML --version 0.102.1
dotnet add package FluentValidation --version 11.9.0

cd ..\..

echo.
echo [7/8] Restoring packages...
dotnet restore

echo.
echo [8/8] Building solution...
dotnet build

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update MySQL connection string in src/OpexManager.Api/appsettings.json
echo 2. Run: cd src\OpexManager.Api
echo 3. Run: dotnet ef migrations add InitialCreate --project ..\OpexManager.Infrastructure
echo 4. Run: dotnet ef database update --project ..\OpexManager.Infrastructure
echo 5. Run: dotnet run
echo.
echo The API will be available at: https://localhost:5001
echo Swagger UI: https://localhost:5001/swagger
echo.
pause
