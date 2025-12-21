# OPEX Manager - Quick Start Guide (All Platforms)

## Overview
This guide will help you set up and run the OPEX Manager in **.NET**, **Java**, or **PHP**.

---

## Prerequisites

### Common Requirements
- **MySQL 8.0+** - Database server
- **Node.js 16+** - For React frontend
- **Git** - Version control

### Platform-Specific Requirements

#### For .NET
- **.NET SDK 8.0+** - [Download](https://dotnet.microsoft.com/download)
- **Visual Studio 2022** or **VS Code** with C# extension

#### For Java
- **Java JDK 17+** - [Download](https://adoptium.net/)
- **Maven 3.8+** or **Gradle 8+**
- **IntelliJ IDEA** or **Eclipse**

#### For PHP
- **PHP 8.2+** - [Download](https://www.php.net/downloads)
- **Composer** - [Download](https://getcomposer.org/)
- **Laravel Installer** - `composer global require laravel/installer`

---

## Quick Setup (Windows)

### Step 1: Setup Database

```bash
# Run the database setup script
setup-database.bat

# Follow the prompts to:
# - Enter MySQL username (default: root)
# - Enter MySQL password
# - Database 'opex_db' will be created automatically
```

### Step 2: Choose Your Platform

#### Option A: .NET

```bash
# Run the .NET setup script
setup-dotnet.bat

# This will:
# - Create solution and projects
# - Install NuGet packages
# - Build the solution

# Then manually:
cd opex-dotnet\src\OpexManager.Api

# Update connection string in appsettings.json
# Then create and run migrations:
dotnet ef migrations add InitialCreate --project ..\OpexManager.Infrastructure
dotnet ef database update --project ..\OpexManager.Infrastructure

# Run the application
dotnet run

# API: https://localhost:5001
# Swagger: https://localhost:5001/swagger
```

#### Option B: Java

```bash
# Run the Java setup script
setup-java.bat

# This will:
# - Create Spring Boot project structure
# - Install dependencies
# - Build the project

# Then:
cd opex-java

# Update application.properties with your MySQL credentials
# Run the application
mvn spring-boot:run

# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

#### Option C: PHP

```bash
# Run the PHP setup script
setup-php.bat

# This will:
# - Create Laravel project
# - Install Composer dependencies
# - Generate application key

# Then:
cd opex-php

# Update .env with your MySQL credentials
# Run migrations
php artisan migrate --seed

# Run the application
php artisan serve

# API: http://localhost:8000
```

### Step 3: Setup Frontend

```bash
# In a new terminal
cd client

# Install dependencies
npm install

# Update API URL in .env
# For .NET: VITE_API_URL=https://localhost:5001
# For Java: VITE_API_URL=http://localhost:8080
# For PHP:  VITE_API_URL=http://localhost:8000

# Run frontend
npm run dev

# Frontend: http://localhost:5173
```

---

## Manual Setup (Cross-Platform)

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE opex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE opex_db;
SOURCE database/mysql_schema.sql;
EXIT;
```

### 2. Backend Setup

#### .NET

```bash
cd opex-dotnet

# Restore packages
dotnet restore

# Update connection string in src/OpexManager.Api/appsettings.json
# "Server=localhost;Database=opex_db;User=root;Password=YOUR_PASSWORD;Port=3306;"

# Create migration
cd src/OpexManager.Api
dotnet ef migrations add InitialCreate --project ../OpexManager.Infrastructure

# Update database
dotnet ef database update --project ../OpexManager.Infrastructure

# Run
dotnet run
```

#### Java

```bash
cd opex-java

# Update src/main/resources/application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/opex_db
# spring.datasource.username=root
# spring.datasource.password=YOUR_PASSWORD

# Build and run
mvn clean install
mvn spring-boot:run
```

#### PHP

```bash
cd opex-php

# Copy environment file
cp .env.example .env

# Update .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=opex_db
# DB_USERNAME=root
# DB_PASSWORD=YOUR_PASSWORD

# Install dependencies
composer install

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate --seed

# Run server
php artisan serve
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5001" > .env

# Run development server
npm run dev
```

---

## Default Credentials

After setup, you can login with:

- **Email**: admin@example.com
- **Password**: admin123

**⚠️ Important**: Change the password after first login!

---

## Testing the API

### Using Swagger UI

#### .NET
- Navigate to: https://localhost:5001/swagger
- Click "Authorize" and enter JWT token

#### Java
- Navigate to: http://localhost:8080/swagger-ui.html
- Click "Authorize" and enter JWT token

#### PHP
- Install Laravel Swagger package first
- Navigate to: http://localhost:8000/api/documentation

### Using cURL

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get budgets (replace TOKEN with actual token)
curl -X GET http://localhost:5001/api/budgets \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API collection (if provided)
2. Set environment variables:
   - `base_url`: http://localhost:5001
   - `token`: (obtained from login)
3. Test endpoints

---

## Common Issues & Solutions

### Database Connection Failed

**Problem**: Cannot connect to MySQL

**Solutions**:
1. Verify MySQL is running: `mysql -u root -p`
2. Check credentials in config files
3. Ensure database exists: `SHOW DATABASES;`
4. Check firewall settings

### Port Already in Use

**Problem**: Port 5001/8080/8000 already in use

**Solutions**:
1. Find process: `netstat -ano | findstr :5001`
2. Kill process or change port in config
3. For .NET: Update `launchSettings.json`
4. For Java: Update `application.properties`
5. For PHP: Use different port: `php artisan serve --port=8001`

### Migration Errors

**Problem**: Database migration fails

**Solutions**:
1. Drop and recreate database
2. Delete migration files and recreate
3. Check entity configurations
4. Verify connection string

### CORS Errors

**Problem**: Frontend cannot connect to backend

**Solutions**:
1. Check CORS configuration in backend
2. Verify frontend URL in allowed origins
3. Clear browser cache
4. Check browser console for exact error

---

## Project Structure

```
opex-manager/
├── database/
│   └── mysql_schema.sql          # MySQL database schema
├── opex-dotnet/                  # .NET implementation
│   ├── src/
│   │   ├── OpexManager.Api/      # Web API
│   │   ├── OpexManager.Core/     # Domain models
│   │   ├── OpexManager.Infrastructure/  # Data access
│   │   └── OpexManager.Services/ # Business logic
│   └── README.md
├── opex-java/                    # Java implementation
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── opex-php/                     # PHP implementation
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── composer.json
├── client/                       # React frontend (shared)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── setup-database.bat            # Database setup script
├── setup-dotnet.bat              # .NET setup script
├── setup-java.bat                # Java setup script
├── setup-php.bat                 # PHP setup script
└── QUICK_START_ALL.md           # This file
```

---

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Update models/entities
   - Create/update services
   - Update controllers
   - Test with Swagger/Postman

2. **Database Changes**:
   - Update schema.sql
   - Create migration (platform-specific)
   - Run migration
   - Update seed data if needed

3. **Frontend Changes**:
   - Update React components
   - Test in browser
   - Verify API integration

### Running Tests

```bash
# .NET
cd opex-dotnet
dotnet test

# Java
cd opex-java
mvn test

# PHP
cd opex-php
php artisan test
```

---

## Deployment

### Production Checklist

- [ ] Update database credentials
- [ ] Change JWT secret keys
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up logging
- [ ] Enable rate limiting
- [ ] Create database backups
- [ ] Update admin password
- [ ] Test all endpoints
- [ ] Monitor performance

### Deployment Options

#### .NET
- IIS (Windows Server)
- Docker container
- Azure App Service
- AWS Elastic Beanstalk

#### Java
- Tomcat server
- Docker container
- AWS Elastic Beanstalk
- Heroku

#### PHP
- Apache/Nginx
- Docker container
- Shared hosting (cPanel)
- Laravel Forge

---

## Support & Resources

### Documentation
- [CONVERSION_PLAN.md](./CONVERSION_PLAN.md) - Conversion strategy
- [CONVERSION_STATUS.md](./CONVERSION_STATUS.md) - Implementation status
- [README.md](./README.md) - Original project docs

### Platform-Specific Docs
- [.NET README](./opex-dotnet/README.md)
- [Java README](./opex-java/README.md)
- [PHP README](./opex-php/README.md)

### External Resources
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Laravel Docs](https://laravel.com/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)

---

## Next Steps

1. ✅ Choose your platform (.NET, Java, or PHP)
2. ✅ Run `setup-database.bat`
3. ✅ Run platform-specific setup script
4. ✅ Update configuration files
5. ✅ Run migrations
6. ✅ Start backend server
7. ✅ Start frontend server
8. ✅ Login and test features

---

**Happy Coding! 🚀**

---

**Version**: 1.0  
**Last Updated**: December 14, 2025  
**Platforms**: .NET 8.0 | Java 17 | PHP 8.2
