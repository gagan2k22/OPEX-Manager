# OPEX Manager - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
│                    (React 18 + Vite + MUI)                          │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Dashboard │  │ Budgets  │  │   POs    │  │ Actuals  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Reports  │  │  Master  │  │  Admin   │  │  Login   │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                      │
│                    HTTP/REST API (JSON)                             │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              .NET / Java / PHP Backend                      │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │           API / Controller Layer                      │  │   │
│  │  │  • Authentication (JWT)                               │  │   │
│  │  │  • Authorization (RBAC)                               │  │   │
│  │  │  • Request Validation                                 │  │   │
│  │  │  • Response Formatting                                │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                           │                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │           Service / Business Logic Layer             │  │   │
│  │  │  • Budget Management                                  │  │   │
│  │  │  • PO Management                                      │  │   │
│  │  │  • Actuals Processing                                 │  │   │
│  │  │  • Excel Import/Export                                │  │   │
│  │  │  • Analytics & Reporting                              │  │   │
│  │  │  • Currency Conversion                                │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                           │                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │           Repository / Data Access Layer             │  │   │
│  │  │  • Generic Repository                                 │  │   │
│  │  │  • Specific Repositories                              │  │   │
│  │  │  • Unit of Work                                       │  │   │
│  │  │  • Transaction Management                             │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                           │                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │           ORM Layer                                   │  │   │
│  │  │  .NET: Entity Framework Core                          │  │   │
│  │  │  Java: Hibernate / JPA                                │  │   │
│  │  │  PHP:  Eloquent ORM                                   │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                 │
│                      MySQL 8.0+ (InnoDB)                            │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Users &    │  │  Master Data │  │   Budgets    │             │
│  │     Auth     │  │              │  │              │             │
│  │              │  │  • Towers    │  │ • LineItems  │             │
│  │ • users      │  │ • BudgetHeads│  │ • BudgetMonths│            │
│  │ • roles      │  │ • Vendors    │  │ • POs        │             │
│  │ • user_roles │  │ • CostCentres│  │ • Actuals    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │     BOA      │  │  Audit &     │  │   Import &   │             │
│  │              │  │   Logging    │  │    Views     │             │
│  │ • BudgetBOAs │  │              │  │              │             │
│  │ • ActualsBOAs│  │ • AuditLogs  │  │ • ImportJobs │             │
│  │ • Calculations│  │ • ActivityLogs│  │ • SavedViews │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Budget Import Flow

```
┌──────────┐
│  User    │
│ (React)  │
└────┬─────┘
     │ 1. Upload Excel File
     ▼
┌─────────────────┐
│  API Controller │
│  /budgets/import│
└────┬────────────┘
     │ 2. Validate File
     ▼
┌─────────────────┐
│  Excel Service  │
│  • Parse Excel  │
│  • Validate Data│
└────┬────────────┘
     │ 3. Process Rows
     ▼
┌─────────────────┐
│ Budget Service  │
│  • Map to DTOs  │
│  • Validate     │
│  • Transform    │
└────┬────────────┘
     │ 4. Save Data
     ▼
┌─────────────────┐
│  Repository     │
│  • Transaction  │
│  • Insert/Update│
└────┬────────────┘
     │ 5. Commit
     ▼
┌─────────────────┐
│  MySQL Database │
│  • line_items   │
│  • budget_months│
└────┬────────────┘
     │ 6. Return Result
     ▼
┌─────────────────┐
│  Import Job Log │
│  • Status       │
│  • Statistics   │
└────┬────────────┘
     │ 7. Response
     ▼
┌──────────┐
│  User    │
│ (Success)│
└──────────┘
```

---

## Authentication Flow

```
┌──────────┐
│  User    │
│ (Login)  │
└────┬─────┘
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌─────────────────┐
│ Auth Controller │
└────┬────────────┘
     │ 2. Validate Input
     ▼
┌─────────────────┐
│  Auth Service   │
│  • Find User    │
│  • Verify Hash  │
└────┬────────────┘
     │ 3. Query Database
     ▼
┌─────────────────┐
│  User Repository│
│  • Get User     │
│  • Get Roles    │
└────┬────────────┘
     │ 4. User Found
     ▼
┌─────────────────┐
│  JWT Service    │
│  • Generate     │
│  • Sign Token   │
└────┬────────────┘
     │ 5. Return Token
     ▼
┌─────────────────┐
│  Response       │
│  { token, user }│
└────┬────────────┘
     │ 6. Store Token
     ▼
┌──────────┐
│  User    │
│(Logged In)│
└──────────┘
```

---

## Database Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id          │◄──────┐
│ name        │       │
│ email       │       │
│ password    │       │
└─────────────┘       │
       │              │
       │ 1:N          │
       ▼              │
┌─────────────┐       │
│  UserRole   │       │
│─────────────│       │
│ user_id     │       │
│ role_id     │       │
└─────────────┘       │
       │              │
       │ N:1          │
       ▼              │
┌─────────────┐       │
│    Role     │       │
│─────────────│       │
│ id          │       │
│ name        │       │
└─────────────┘       │
                      │
┌─────────────┐       │
│   Tower     │       │
│─────────────│       │
│ id          │       │
│ name        │       │
└─────────────┘       │
       │              │
       │ 1:N          │
       ▼              │
┌─────────────┐       │
│ BudgetHead  │       │
│─────────────│       │
│ id          │       │
│ name        │       │
│ tower_id    │       │
└─────────────┘       │
       │              │
       │ 1:N          │
       ▼              │
┌─────────────┐       │
│  LineItem   │       │
│─────────────│       │
│ id          │       │
│ uid         │       │
│ description │       │
│ tower_id    │       │
│ budget_head │       │
│ vendor_id   │       │
│ total_budget│       │
│ created_by  │───────┘
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│BudgetMonth  │
│─────────────│
│ id          │
│ line_item_id│
│ month       │
│ amount      │
└─────────────┘

┌─────────────┐
│   Vendor    │
│─────────────│
│ id          │
│ name        │
│ gst_number  │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│     PO      │
│─────────────│
│ id          │
│ po_number   │
│ vendor_id   │
│ po_value    │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│ POLineItem  │
│─────────────│
│ po_id       │
│ line_item_id│
│ amount      │
└─────────────┘

┌─────────────┐
│   Actual    │
│─────────────│
│ id          │
│ invoice_no  │
│ amount      │
│ line_item_id│
│ vendor_id   │
└─────────────┘
```

---

## Technology Stack Comparison

```
┌──────────────────────────────────────────────────────────────────┐
│                    PLATFORM COMPARISON                            │
├──────────────┬─────────────────┬─────────────────┬───────────────┤
│   Feature    │      .NET       │      Java       │      PHP      │
├──────────────┼─────────────────┼─────────────────┼───────────────┤
│ Framework    │ ASP.NET Core 8  │ Spring Boot 3.2 │ Laravel 11    │
│ Language     │ C# 12           │ Java 17         │ PHP 8.2       │
│ ORM          │ EF Core         │ Hibernate/JPA   │ Eloquent      │
│ DB Provider  │ Pomelo MySQL    │ MySQL Connector │ Native MySQL  │
│ Auth         │ JWT Bearer      │ Spring Security │ Sanctum/JWT   │
│ Validation   │ FluentValidation│ Hibernate Valid │ Laravel Valid │
│ Excel        │ ClosedXML       │ Apache POI      │ Maatwebsite   │
│ Logging      │ Serilog         │ SLF4J/Logback   │ Monolog       │
│ DI Container │ Built-in        │ Spring IoC      │ Laravel IoC   │
│ Testing      │ xUnit/NUnit     │ JUnit/Mockito   │ PHPUnit       │
│ API Docs     │ Swagger/OpenAPI │ SpringDoc       │ L5-Swagger    │
│ Performance  │ ⭐⭐⭐⭐⭐        │ ⭐⭐⭐⭐         │ ⭐⭐⭐          │
│ Scalability  │ ⭐⭐⭐⭐⭐        │ ⭐⭐⭐⭐⭐        │ ⭐⭐⭐⭐         │
│ Learning     │ ⭐⭐⭐           │ ⭐⭐⭐           │ ⭐⭐⭐⭐⭐        │
│ Deployment   │ IIS/Docker/Azure│ Tomcat/Docker   │ Apache/Nginx  │
└──────────────┴─────────────────┴─────────────────┴───────────────┘
```

---

## Deployment Architecture

### Production Deployment

```
                        ┌─────────────┐
                        │   Internet  │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │  Load       │
                        │  Balancer   │
                        └──────┬──────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
         │   Web       ││   Web       ││   Web       │
         │  Server 1   ││  Server 2   ││  Server 3   │
         │  (Backend)  ││  (Backend)  ││  (Backend)  │
         └──────┬──────┘└──────┬──────┘└──────┬──────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                        ┌──────▼──────┐
                        │   MySQL     │
                        │   Master    │
                        └──────┬──────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
         │   MySQL     ││   MySQL     ││   MySQL     │
         │  Replica 1  ││  Replica 2  ││  Replica 3  │
         └─────────────┘└─────────────┘└─────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Network Security                                │    │
│  │     • HTTPS/TLS                                     │    │
│  │     • Firewall Rules                                │    │
│  │     • DDoS Protection                               │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐    │
│  │  2. Application Security                            │    │
│  │     • CORS Configuration                            │    │
│  │     • Rate Limiting                                 │    │
│  │     • Input Validation                              │    │
│  │     • XSS Protection                                │    │
│  │     • CSRF Protection                               │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐    │
│  │  3. Authentication & Authorization                  │    │
│  │     • JWT Tokens                                    │    │
│  │     • Role-Based Access Control                     │    │
│  │     • Password Hashing (BCrypt)                     │    │
│  │     • Token Expiration                              │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐    │
│  │  4. Data Security                                   │    │
│  │     • SQL Injection Prevention (ORM)                │    │
│  │     • Encrypted Connections                         │    │
│  │     • Sensitive Data Encryption                     │    │
│  │     • Secure File Uploads                           │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐    │
│  │  5. Audit & Monitoring                              │    │
│  │     • Activity Logging                              │    │
│  │     • Audit Trails                                  │    │
│  │     • Error Tracking                                │    │
│  │     • Performance Monitoring                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure Comparison

### .NET Project Structure
```
OpexManager/
├── src/
│   ├── OpexManager.Api/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── OpexManager.Core/
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── DTOs/
│   ├── OpexManager.Infrastructure/
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Migrations/
│   └── OpexManager.Services/
│       └── Services/
└── tests/
```

### Java Project Structure
```
opex-java/
├── src/
│   ├── main/
│   │   ├── java/com/opex/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── model/
│   │   │   └── config/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   └── test/
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
└── config/
```

---

**Created**: December 14, 2025  
**Version**: 1.0  
**Purpose**: Visual reference for OPEX Manager architecture
