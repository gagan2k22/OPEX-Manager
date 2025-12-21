# OPEX Manager - Multi-Platform Conversion Plan

## Overview
This document outlines the conversion of the OPEX Management System from Node.js/SQLite to three different technology stacks, all using MySQL as the database.

---

## Target Platforms

### 1. **.NET Version**
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core
- **Database**: MySQL 8.0+
- **Frontend**: React (same as original)
- **Architecture**: Clean Architecture with Repository Pattern

### 2. **Java Version**
- **Framework**: Spring Boot 3.2+
- **ORM**: Spring Data JPA with Hibernate
- **Database**: MySQL 8.0+
- **Frontend**: React (same as original)
- **Architecture**: Layered Architecture with Service Pattern

### 3. **PHP Version**
- **Framework**: Laravel 11
- **ORM**: Eloquent ORM
- **Database**: MySQL 8.0+
- **Frontend**: React (same as original)
- **Architecture**: MVC with Repository Pattern

---

## Database Schema Conversion

### SQLite to MySQL Changes

1. **Auto-increment**: SQLite's `autoincrement()` → MySQL's `AUTO_INCREMENT`
2. **DateTime**: SQLite's `DateTime` → MySQL's `DATETIME` or `TIMESTAMP`
3. **Boolean**: SQLite's `Boolean` → MySQL's `TINYINT(1)` or `BOOLEAN`
4. **JSON Fields**: SQLite's `String` (JSON) → MySQL's `JSON` type
5. **Indexes**: Add proper indexes for foreign keys and frequently queried fields
6. **Constraints**: Add proper foreign key constraints with ON DELETE/UPDATE rules

### Common MySQL Schema Features

```sql
-- Example table structure
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Directory Structure

### .NET Project Structure
```
opex-dotnet/
├── src/
│   ├── OpexManager.Api/              # Web API project
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── OpexManager.Core/             # Domain layer
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── DTOs/
│   ├── OpexManager.Infrastructure/   # Data access
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Migrations/
│   └── OpexManager.Services/         # Business logic
│       └── Services/
├── client/                           # React frontend (shared)
└── OpexManager.sln
```

### Java Project Structure
```
opex-java/
├── src/
│   └── main/
│       ├── java/com/opex/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── model/
│       │   ├── dto/
│       │   ├── config/
│       │   └── OpexApplication.java
│       └── resources/
│           ├── application.properties
│           └── db/migration/
├── client/                           # React frontend (shared)
└── pom.xml
```

### PHP Project Structure
```
opex-php/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/
│   └── Repositories/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── config/
├── public/
│   └── index.php
├── client/                           # React frontend (shared)
├── composer.json
└── artisan
```

---

## API Endpoint Mapping

All three versions will implement the same REST API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Budget Management
- `GET /api/budgets` - List all budgets
- `GET /api/budgets/:id` - Get budget details
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `POST /api/budgets/import` - Import from Excel
- `GET /api/budgets/export` - Export to Excel

### Purchase Orders
- `GET /api/pos` - List all POs
- `GET /api/pos/:id` - Get PO details
- `POST /api/pos` - Create PO
- `PUT /api/pos/:id` - Update PO
- `DELETE /api/pos/:id` - Delete PO

### Actuals
- `GET /api/actuals` - List all actuals
- `POST /api/actuals/import` - Import actuals
- `GET /api/actuals/export` - Export actuals

### Master Data
- `GET /api/master/towers` - Get towers
- `GET /api/master/budget-heads` - Get budget heads
- `GET /api/master/vendors` - Get vendors
- `GET /api/master/cost-centres` - Get cost centres
- `POST /api/master/*` - Create master data
- `PUT /api/master/*/:id` - Update master data
- `DELETE /api/master/*/:id` - Delete master data

### Reports & Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/variance` - Variance analysis
- `GET /api/reports/vendor-analysis` - Vendor analysis

---

## Technology-Specific Implementation Details

### .NET Implementation

**Key Libraries:**
- `Microsoft.EntityFrameworkCore` - ORM
- `Pomelo.EntityFrameworkCore.MySql` - MySQL provider
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT auth
- `EPPlus` or `ClosedXML` - Excel processing
- `AutoMapper` - Object mapping
- `FluentValidation` - Input validation

**Configuration (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=opex_db;User=root;Password=password;"
  },
  "Jwt": {
    "Secret": "your-secret-key",
    "Issuer": "opex-api",
    "Audience": "opex-client",
    "ExpiryMinutes": 60
  }
}
```

### Java Implementation

**Key Dependencies (pom.xml):**
- `spring-boot-starter-web` - Web framework
- `spring-boot-starter-data-jpa` - JPA/Hibernate
- `mysql-connector-java` - MySQL driver
- `spring-boot-starter-security` - Security
- `jjwt` - JWT library
- `apache-poi` - Excel processing
- `modelmapper` - Object mapping
- `hibernate-validator` - Validation

**Configuration (application.properties):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/opex_db
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
jwt.secret=your-secret-key
jwt.expiration=3600000
```

### PHP Implementation

**Key Packages (composer.json):**
- `laravel/framework` - Framework
- `laravel/sanctum` - API authentication
- `doctrine/dbal` - Database abstraction
- `maatwebsite/excel` - Excel import/export
- `spatie/laravel-permission` - Role/permission management
- `tymon/jwt-auth` - JWT authentication

**Configuration (.env):**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=opex_db
DB_USERNAME=root
DB_PASSWORD=password

JWT_SECRET=your-secret-key
JWT_TTL=60
```

---

## Migration Strategy

### Phase 1: Database Setup
1. Create MySQL database
2. Generate migration scripts for each platform
3. Run migrations
4. Seed initial data (roles, users, master data)

### Phase 2: Backend Development
1. Set up project structure
2. Implement database models/entities
3. Create repositories/data access layer
4. Implement services/business logic
5. Create API controllers
6. Add authentication & authorization
7. Implement middleware (logging, error handling)

### Phase 3: Excel Import/Export
1. Implement Excel parsing logic
2. Add validation rules
3. Create import/export services
4. Test with sample files

### Phase 4: Frontend Integration
1. Update API base URL in React app
2. Test all endpoints
3. Fix any CORS issues
4. Verify authentication flow

### Phase 5: Testing & Deployment
1. Unit tests
2. Integration tests
3. Performance testing
4. Security audit
5. Documentation
6. Deployment scripts

---

## Common Features Across All Platforms

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Editor, Approver, Viewer)
- Password hashing (bcrypt)
- Token refresh mechanism

### Audit Logging
- User activity tracking
- Change history for all entities
- IP address logging
- Timestamp tracking

### Excel Import/Export
- Budget import with validation
- Actuals import with auto-linking
- Export to Excel with formatting
- Error reporting for failed imports

### Performance Optimizations
- Database indexing
- Query optimization
- Caching (Redis optional)
- Pagination for large datasets
- Lazy loading for related entities

### Error Handling
- Global exception handling
- Structured error responses
- Logging to file/database
- User-friendly error messages

---

## Testing Strategy

### Unit Tests
- Service layer tests
- Repository tests
- Utility function tests

### Integration Tests
- API endpoint tests
- Database integration tests
- Authentication flow tests

### End-to-End Tests
- Complete user workflows
- Import/export functionality
- Report generation

---

## Deployment Considerations

### .NET Deployment
- **IIS**: Windows Server with IIS
- **Docker**: Linux containers
- **Azure**: Azure App Service
- **Self-hosted**: Kestrel server

### Java Deployment
- **Tomcat**: Traditional WAR deployment
- **Docker**: Spring Boot JAR in container
- **AWS**: Elastic Beanstalk
- **Self-hosted**: Embedded Tomcat

### PHP Deployment
- **Apache/Nginx**: Traditional LAMP stack
- **Docker**: PHP-FPM + Nginx
- **Shared Hosting**: cPanel/Plesk
- **Cloud**: AWS, DigitalOcean, Heroku

---

## Timeline Estimate

| Phase | .NET | Java | PHP |
|-------|------|------|-----|
| Setup & Database | 2 days | 2 days | 1 day |
| Core Models | 3 days | 3 days | 2 days |
| API Endpoints | 5 days | 5 days | 4 days |
| Auth & Security | 2 days | 2 days | 2 days |
| Excel Features | 3 days | 3 days | 2 days |
| Testing | 3 days | 3 days | 2 days |
| **Total** | **18 days** | **18 days** | **13 days** |

---

## Next Steps

1. **Choose Priority**: Which platform to implement first?
2. **Database Setup**: Create MySQL database and schema
3. **Project Initialization**: Set up project structure
4. **Core Implementation**: Start with authentication and basic CRUD
5. **Feature Parity**: Ensure all features match the original
6. **Testing**: Comprehensive testing
7. **Documentation**: API docs and deployment guides

---

## Maintenance & Support

### Version Control
- Separate Git repositories for each platform
- Shared React frontend as Git submodule
- Common documentation repository

### CI/CD
- Automated builds
- Automated testing
- Deployment pipelines

### Monitoring
- Application performance monitoring
- Error tracking (Sentry, Rollbar)
- Database monitoring
- User analytics

---

**Document Version**: 1.0  
**Last Updated**: December 14, 2025  
**Status**: Ready for Implementation
