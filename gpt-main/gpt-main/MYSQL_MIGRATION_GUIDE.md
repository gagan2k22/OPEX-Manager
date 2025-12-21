# OPEX Manager - Node.js to MySQL Migration Guide

## 🎯 Migration Overview

This guide will help you migrate your OPEX Manager from **SQLite to MySQL** while keeping the Node.js/Express backend.

**Benefits**:
- ✅ Better scalability (1000+ concurrent users)
- ✅ Enterprise features (replication, backup)
- ✅ Better performance
- ✅ Keep familiar Node.js stack
- ✅ No code rewrite needed

**Time Required**: 2-3 hours

---

## 📋 Prerequisites

### Option 1: Local MySQL (Recommended for Production)
- MySQL 8.0+ installed locally
- MySQL Workbench (optional, for GUI)

### Option 2: Cloud MySQL (Easiest)
- Free tier: [PlanetScale](https://planetscale.com/) or [Railway](https://railway.app/)
- No installation needed

### Option 3: Docker MySQL (For Development)
- Docker Desktop installed
- Quick setup with containers

---

## 🚀 Quick Start (Choose One Path)

### Path A: Using Docker (Fastest - Recommended)

```bash
# 1. Start MySQL in Docker
docker run --name opex-mysql -e MYSQL_ROOT_PASSWORD=opex123 -e MYSQL_DATABASE=opex_db -p 3306:3306 -d mysql:8.0

# 2. Wait 30 seconds for MySQL to start
timeout /t 30

# 3. Update Prisma schema (see below)

# 4. Run migration
cd server
npx prisma migrate dev --name mysql_migration

# 5. Start application
npm run dev
```

### Path B: Using Local MySQL

```bash
# 1. Install MySQL 8.0 from https://dev.mysql.com/downloads/mysql/

# 2. Create database
mysql -u root -p
CREATE DATABASE opex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. Update Prisma schema (see below)

# 4. Run migration
cd server
npx prisma migrate dev --name mysql_migration

# 5. Start application
npm run dev
```

### Path C: Using Cloud MySQL (PlanetScale)

```bash
# 1. Sign up at https://planetscale.com/ (free tier)

# 2. Create database "opex_db"

# 3. Get connection string from dashboard

# 4. Update .env with connection string

# 5. Run migration
cd server
npx prisma db push

# 6. Start application
npm run dev
```

---

## 📝 Step-by-Step Migration

### Step 1: Backup Current Database

```bash
# Backup SQLite database
cd server
copy prisma\dev.db prisma\dev.db.backup
```

### Step 2: Update Prisma Schema

The schema file has been updated for you at:
`server/prisma/schema-mysql.prisma`

**Key Changes**:
- `provider = "sqlite"` → `provider = "mysql"`
- `@default(autoincrement())` → `@default(autoincrement())`
- `DateTime` → `DateTime @db.DateTime`
- JSON fields properly typed

### Step 3: Update Environment Variables

Update `server/.env`:

```env
# For Docker MySQL
DATABASE_URL="mysql://root:opex123@localhost:3306/opex_db"

# For Local MySQL
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/opex_db"

# For PlanetScale (example)
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/opex_db?sslaccept=strict"

# Other settings remain the same
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

### Step 4: Install MySQL Prisma Client

```bash
cd server
npm install @prisma/client
npm install prisma --save-dev
```

### Step 5: Generate Prisma Client

```bash
cd server
npx prisma generate
```

### Step 6: Create and Run Migration

```bash
cd server

# Create migration
npx prisma migrate dev --name init_mysql

# This will:
# 1. Create migration files
# 2. Apply migration to MySQL
# 3. Generate Prisma Client
```

### Step 7: Migrate Data (Optional)

If you want to keep existing data:

```bash
# Export data from SQLite
cd server
node scripts/export-sqlite-data.js

# Import data to MySQL
node scripts/import-to-mysql.js
```

### Step 8: Test the Application

```bash
cd server
npm run dev

# In another terminal
cd client
npm run dev

# Test login at http://localhost:5173
# Email: admin@example.com
# Password: admin123
```

---

## 🔧 Troubleshooting

### Issue: "Can't connect to MySQL server"

**Solution**:
```bash
# Check if MySQL is running
# For Docker:
docker ps

# For Local MySQL:
# Windows: Check Services (services.msc)
# Look for "MySQL80" service

# Start MySQL if not running
docker start opex-mysql
```

### Issue: "Access denied for user"

**Solution**:
```bash
# Check password in .env matches MySQL password
# Reset MySQL password if needed:
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Issue: "Database does not exist"

**Solution**:
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE opex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Issue: "Migration failed"

**Solution**:
```bash
# Reset migrations
cd server
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Recreate database
# 3. Run all migrations
# 4. Run seed script
```

---

## 📊 Verification Checklist

After migration, verify:

- [ ] MySQL is running
- [ ] Database `opex_db` exists
- [ ] All tables created (check with MySQL Workbench or CLI)
- [ ] Backend starts without errors
- [ ] Can login to application
- [ ] Can view budgets/POs/actuals
- [ ] Can create new records
- [ ] Can import Excel files
- [ ] Can export data

---

## 🎯 Performance Comparison

### Before (SQLite)
- Max concurrent users: ~100
- Database size limit: 1GB
- Write operations: Sequential only
- Backup: Manual file copy

### After (MySQL)
- Max concurrent users: 1000+
- Database size limit: Unlimited
- Write operations: Concurrent
- Backup: Automated, point-in-time recovery

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# 1. Stop the application

# 2. Restore Prisma schema
cd server/prisma
copy schema.prisma.backup schema.prisma

# 3. Restore .env
copy .env.backup .env

# 4. Restore database
copy dev.db.backup dev.db

# 5. Regenerate Prisma client
npx prisma generate

# 6. Restart application
npm run dev
```

---

## 📈 Next Steps After Migration

### Immediate
1. ✅ Test all features thoroughly
2. ✅ Monitor performance
3. ✅ Set up database backups
4. ✅ Update documentation

### Short-term (1-2 weeks)
1. ✅ Set up MySQL replication (for high availability)
2. ✅ Configure automated backups
3. ✅ Set up monitoring (MySQL Workbench, Grafana)
4. ✅ Optimize queries with indexes

### Long-term (1-3 months)
1. ✅ Consider read replicas for scaling
2. ✅ Implement caching (Redis)
3. ✅ Set up database monitoring
4. ✅ Plan for database maintenance windows

---

## 💡 Tips for Success

1. **Test in Development First**: Don't migrate production directly
2. **Backup Everything**: Database, code, configuration
3. **Monitor Performance**: Use MySQL slow query log
4. **Plan Downtime**: Schedule migration during low-traffic period
5. **Have Rollback Ready**: Test rollback procedure before migration

---

## 🆘 Getting Help

### Documentation
- [Prisma MySQL Guide](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker MySQL](https://hub.docker.com/_/mysql)

### Common Commands

```bash
# Check MySQL status
docker ps  # For Docker
services.msc  # For Windows service

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE opex_db;

# Show tables
SHOW TABLES;

# Check table structure
DESCRIBE users;

# View Prisma migrations
npx prisma migrate status

# Reset database (DANGER!)
npx prisma migrate reset
```

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Prisma migration logs
3. Check MySQL error logs
4. Verify connection string in .env

---

**Migration Time**: 2-3 hours  
**Difficulty**: Medium  
**Risk**: Low (with proper backup)  
**Benefit**: High (immediate scalability)

---

**Ready to migrate? Follow the Quick Start guide above!** 🚀
