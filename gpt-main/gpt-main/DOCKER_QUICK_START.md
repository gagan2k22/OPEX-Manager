# 🐳 OPEX Manager - Docker Quick Start Guide

## 📋 Prerequisites

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
2. **Git** (already installed)
3. **Windows 10/11** with WSL2 enabled (for Docker)

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Ensure Docker is Running
- Open Docker Desktop
- Wait for it to fully start (whale icon in system tray should be steady)

### Step 2: Start the Application
```bash
# Simply double-click or run:
docker-start.bat
```

This will:
- ✅ Build all Docker images
- ✅ Start Redis cache
- ✅ Start backend server (port 5000)
- ✅ Start frontend client (port 5173)
- ✅ Automatically open the app in your browser

### Step 3: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🛠️ Management Scripts

### Start Application
```bash
docker-start.bat
```

### Stop Application
```bash
docker-stop.bat
```

### View Logs
```bash
docker-logs.bat
```

### Restart Services
```bash
docker-compose -f docker-compose.dev.yml restart
```

### Rebuild After Code Changes
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│         Docker Network (opex-network)   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │  Client  │  │  Server  │  │ Redis│ │
│  │  :5173   │←→│  :5000   │←→│ :6379│ │
│  │  (Vite)  │  │ (Express)│  │      │ │
│  └──────────┘  └──────────┘  └──────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Issue: Docker not starting
**Solution**: 
1. Restart Docker Desktop
2. Check WSL2 is enabled: `wsl --status`
3. Update Docker Desktop to latest version

### Issue: Port already in use
**Solution**:
```bash
# Stop any existing services
docker-compose -f docker-compose.dev.yml down

# Check what's using the port
netstat -ano | findstr :5173
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Issue: Database not initializing
**Solution**:
```bash
# Reset everything
docker-compose -f docker-compose.dev.yml down -v
docker-start.bat
```

### Issue: Changes not reflecting
**Solution**:
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🔍 Useful Commands

### Check Container Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Execute Commands in Container
```bash
# Server container
docker exec -it opex-server sh

# Client container
docker exec -it opex-client sh

# Redis container
docker exec -it opex-redis redis-cli
```

### View Real-time Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f server
docker-compose -f docker-compose.dev.yml logs -f client
docker-compose -f docker-compose.dev.yml logs -f redis
```

### Database Operations
```bash
# Access server container
docker exec -it opex-server sh

# Run Prisma commands
npx prisma migrate dev
npx prisma studio
npx prisma db push
```

## 🌐 Environment Configuration

The Docker setup uses these default configurations:

### Server (Backend)
- Port: 5000
- Database: SQLite (file-based)
- Redis: Connected to redis container
- CORS: Allows localhost:5173

### Client (Frontend)
- Port: 5173
- API URL: http://localhost:5000/api
- Hot Reload: Enabled

### Redis
- Port: 6379
- Persistence: Enabled (data survives restarts)

## 📦 Data Persistence

Data is stored in Docker volumes:
- **Database**: `./server/database` (mounted volume)
- **Redis**: `redis_data` (Docker volume)

To completely reset:
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## 🚫 Railway Deployment - DISABLED

Railway deployment has been disabled for localhost-only development.

**Files modified:**
- `railway.json` → `railway.json.disabled`
- `.railwayignore` → Kept for reference

**To re-enable Railway:**
1. Rename `railway.json.disabled` to `railway.json`
2. Configure Railway environment variables
3. Push to Railway

## 🎯 Development Workflow

1. **Make code changes** in your IDE
2. **Changes auto-reload** (hot reload enabled)
3. **Test in browser** at http://localhost:5173
4. **View logs** if needed: `docker-logs.bat`
5. **Commit changes** when ready

## 🔐 Default Credentials

See `Default credentials.txt` for login information.

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project README](./README.md)
- [Testing Guide](./TESTING_GUIDE.md)

## 💡 Tips

1. **Keep Docker Desktop running** while developing
2. **Use docker-logs.bat** to debug issues
3. **Database persists** between restarts
4. **Hot reload works** - no need to restart on code changes
5. **Clean up** with `docker-compose down -v` if things get messy

## 🆘 Need Help?

1. Check logs: `docker-logs.bat`
2. Restart services: `docker-compose -f docker-compose.dev.yml restart`
3. Full reset: `docker-compose -f docker-compose.dev.yml down -v && docker-start.bat`

---

**Happy Coding! 🚀**
