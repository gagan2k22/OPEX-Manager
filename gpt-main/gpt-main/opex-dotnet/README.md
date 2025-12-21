# OPEX Manager - .NET Implementation Guide

## Overview
This is the ASP.NET Core implementation of the OPEX Management System using Entity Framework Core and MySQL.

---

## Prerequisites

- **.NET SDK 8.0** or later
- **MySQL 8.0+**
- **Visual Studio 2022** or **VS Code** with C# extension
- **Node.js 16+** (for React frontend)

---

## Project Structure

```
opex-dotnet/
├── src/
│   ├── OpexManager.Api/              # Web API Layer
│   ├── OpexManager.Core/             # Domain Layer
│   ├── OpexManager.Infrastructure/   # Data Access Layer
│   └── OpexManager.Services/         # Business Logic Layer
├── tests/
│   ├── OpexManager.Tests.Unit/
│   └── OpexManager.Tests.Integration/
├── client/                           # React Frontend
├── OpexManager.sln
└── README.md
```

---

## Quick Start

### 1. Create the Solution

```bash
# Navigate to project directory
cd "c:\jpm\final project\gpt-main\gpt-main"

# Create solution directory
mkdir opex-dotnet
cd opex-dotnet

# Create solution
dotnet new sln -n OpexManager

# Create projects
dotnet new webapi -n OpexManager.Api -o src/OpexManager.Api
dotnet new classlib -n OpexManager.Core -o src/OpexManager.Core
dotnet new classlib -n OpexManager.Infrastructure -o src/OpexManager.Infrastructure
dotnet new classlib -n OpexManager.Services -o src/OpexManager.Services

# Add projects to solution
dotnet sln add src/OpexManager.Api/OpexManager.Api.csproj
dotnet sln add src/OpexManager.Core/OpexManager.Core.csproj
dotnet sln add src/OpexManager.Infrastructure/OpexManager.Infrastructure.csproj
dotnet sln add src/OpexManager.Services/OpexManager.Services.csproj

# Add project references
dotnet add src/OpexManager.Api reference src/OpexManager.Core
dotnet add src/OpexManager.Api reference src/OpexManager.Infrastructure
dotnet add src/OpexManager.Api reference src/OpexManager.Services
dotnet add src/OpexManager.Infrastructure reference src/OpexManager.Core
dotnet add src/OpexManager.Services reference src/OpexManager.Core
```

### 2. Install NuGet Packages

```bash
# OpexManager.Api
cd src/OpexManager.Api
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Cors
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection

# OpexManager.Infrastructure
cd ../OpexManager.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design

# OpexManager.Services
cd ../OpexManager.Services
dotnet add package BCrypt.Net-Next
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package ClosedXML
dotnet add package FluentValidation
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE opex_db;
USE opex_db;
SOURCE ../../database/mysql_schema.sql;
EXIT;

# Update connection string in appsettings.json
# Then run migrations
cd src/OpexManager.Api
dotnet ef migrations add InitialCreate --project ../OpexManager.Infrastructure
dotnet ef database update --project ../OpexManager.Infrastructure
```

### 4. Run the Application

```bash
# Start backend
cd src/OpexManager.Api
dotnet run

# Backend runs on https://localhost:5001

# Start frontend (in new terminal)
cd ../../client
npm install
npm run dev

# Frontend runs on http://localhost:5173
```

---

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=opex_db;User=root;Password=your_password;Port=3306;"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-min-32-characters-long",
    "Issuer": "opex-api",
    "Audience": "opex-client",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

---

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with BCrypt
- Token refresh mechanism

### API Endpoints
- RESTful API design
- Swagger/OpenAPI documentation
- Versioning support
- Rate limiting

### Data Access
- Entity Framework Core
- Repository pattern
- Unit of Work pattern
- Database migrations

### Business Logic
- Service layer architecture
- FluentValidation for input validation
- AutoMapper for DTO mapping
- Transaction management

### Excel Import/Export
- ClosedXML for Excel processing
- Budget import with validation
- Actuals import with auto-linking
- Export with formatting

---

## Architecture Layers

### 1. OpexManager.Core (Domain Layer)
- **Entities**: Database models
- **Interfaces**: Repository and service interfaces
- **DTOs**: Data transfer objects
- **Enums**: Application enumerations

### 2. OpexManager.Infrastructure (Data Layer)
- **DbContext**: Entity Framework context
- **Repositories**: Data access implementations
- **Migrations**: Database migrations
- **Configurations**: Entity configurations

### 3. OpexManager.Services (Business Layer)
- **Services**: Business logic implementations
- **Validators**: FluentValidation validators
- **Mappers**: AutoMapper profiles
- **Helpers**: Utility classes

### 4. OpexManager.Api (Presentation Layer)
- **Controllers**: API endpoints
- **Middleware**: Custom middleware
- **Filters**: Action filters
- **Extensions**: Service extensions

---

## Development Workflow

### 1. Adding a New Entity

```csharp
// 1. Create entity in OpexManager.Core/Entities
public class MyEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// 2. Add DbSet in OpexManager.Infrastructure/Data/ApplicationDbContext.cs
public DbSet<MyEntity> MyEntities { get; set; }

// 3. Create migration
dotnet ef migrations add AddMyEntity

// 4. Update database
dotnet ef database update
```

### 2. Adding a New API Endpoint

```csharp
// 1. Create DTO in OpexManager.Core/DTOs
public class MyEntityDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

// 2. Create service interface in OpexManager.Core/Interfaces
public interface IMyEntityService
{
    Task<List<MyEntityDto>> GetAllAsync();
}

// 3. Implement service in OpexManager.Services
public class MyEntityService : IMyEntityService
{
    // Implementation
}

// 4. Create controller in OpexManager.Api/Controllers
[ApiController]
[Route("api/[controller]")]
public class MyEntityController : ControllerBase
{
    // Implementation
}
```

---

## Testing

### Unit Tests
```bash
cd tests/OpexManager.Tests.Unit
dotnet test
```

### Integration Tests
```bash
cd tests/OpexManager.Tests.Integration
dotnet test
```

---

## Deployment

### Development
```bash
dotnet run --environment Development
```

### Production
```bash
# Publish
dotnet publish -c Release -o ./publish

# Run
cd publish
dotnet OpexManager.Api.dll
```

### Docker
```bash
# Build image
docker build -t opex-manager-dotnet .

# Run container
docker run -p 5000:80 -e ConnectionStrings__DefaultConnection="Server=mysql;Database=opex_db;User=root;Password=password;" opex-manager-dotnet
```

---

## API Documentation

Once running, access Swagger UI at:
- **Development**: https://localhost:5001/swagger
- **Production**: https://your-domain.com/swagger

---

## Common Commands

```bash
# Restore packages
dotnet restore

# Build solution
dotnet build

# Run tests
dotnet test

# Create migration
dotnet ef migrations add MigrationName --project src/OpexManager.Infrastructure --startup-project src/OpexManager.Api

# Update database
dotnet ef database update --project src/OpexManager.Infrastructure --startup-project src/OpexManager.Api

# Remove last migration
dotnet ef migrations remove --project src/OpexManager.Infrastructure --startup-project src/OpexManager.Api

# Generate SQL script
dotnet ef migrations script --project src/OpexManager.Infrastructure --startup-project src/OpexManager.Api -o migration.sql
```

---

## Troubleshooting

### Connection Issues
- Verify MySQL is running
- Check connection string
- Ensure database exists
- Verify user permissions

### Migration Issues
- Delete Migrations folder and recreate
- Check entity configurations
- Verify DbContext registration

### JWT Issues
- Ensure secret key is at least 32 characters
- Check token expiry settings
- Verify CORS configuration

---

## Performance Tips

1. **Enable Response Compression**
2. **Use Response Caching**
3. **Implement Database Indexing**
4. **Use Async/Await Properly**
5. **Enable Connection Pooling**
6. **Optimize EF Core Queries**
7. **Use Pagination for Large Datasets**

---

## Security Best Practices

1. **Use HTTPS in Production**
2. **Enable CORS Properly**
3. **Implement Rate Limiting**
4. **Validate All Inputs**
5. **Use Parameterized Queries**
6. **Hash Passwords with BCrypt**
7. **Implement Audit Logging**
8. **Keep Packages Updated**

---

## Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [Pomelo MySQL Provider](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)
- [AutoMapper](https://automapper.org/)
- [FluentValidation](https://fluentvalidation.net/)

---

**Version**: 1.0  
**Last Updated**: December 14, 2025  
**Status**: Ready for Development
