# ⚡ QUICK START - Security Configuration

## 🚨 CRITICAL: Do These 3 Things FIRST

### 1️⃣ Change Admin Password
```
Login at: http://localhost:5173
Email: admin@example.com
Password: password123

→ Go to User Management
→ Edit admin user
→ Set strong password (8+ chars, uppercase, lowercase, digit, special char)
```

### 2️⃣ Verify .env Secrets
```bash
# Check these are NOT the defaults:
JWT_SECRET="8kN9mP2vQ5wX7yZ0aB3cD6eF9gH2jK5mN8pQ1rS4tU7vW0xY3zA6bC9dE2fG5hJ8"
SESSION_SECRET="xY9zA2bC5dE8fG1hJ4kL7mN0pQ3rS6tU9vW2xY5zA8bC1dE4fG7hJ0kL3mN6pQ9"

# For production, generate new ones:
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3️⃣ Update CORS for Production
```bash
# In .env, change:
CORS_ORIGIN="http://localhost:5173"

# To your production URL:
CORS_ORIGIN="https://yourdomain.com"
```

---

## ✅ Security Features Active

✅ Strong JWT secrets (64 characters)  
✅ SQL injection protection  
✅ XSS protection headers  
✅ CSRF protection headers  
✅ File upload validation  
✅ Password strength enforcement  
✅ Rate limiting (5 login attempts/min)  
✅ Path traversal prevention  
✅ Error handling  
✅ Audit logging  

---

## 🔒 Password Requirements

When creating/updating users:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase (A-Z)
- ✅ At least 1 lowercase (a-z)
- ✅ At least 1 digit (0-9)
- ✅ At least 1 special character (!@#$%^&*)

Example: `SecureP@ss123`

---

## 📁 File Upload Limits

- ✅ Allowed: `.xlsx`, `.xls` only
- ✅ Max size: 10MB
- ✅ Path traversal: Blocked
- ✅ Malicious files: Rejected

---

## 🛡️ Rate Limits

| Endpoint | Limit |
|----------|-------|
| Login | 5 attempts/minute |
| API calls | 100 requests/minute |

---

## 📋 Pre-Deployment Checklist

- [ ] Changed admin password
- [ ] Updated JWT_SECRET
- [ ] Updated SESSION_SECRET  
- [ ] Set CORS_ORIGIN to production URL
- [ ] Set NODE_ENV=production
- [ ] Configured HTTPS/SSL
- [ ] Tested login with new password
- [ ] Verified file uploads work
- [ ] Checked all features work

---

## 🚀 Start Application

```bash
# Backend (Terminal 1)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Access: http://localhost:5173

---

## 📚 Full Documentation

- **Security Guide:** `SECURITY.md`
- **Fixes Applied:** `SECURITY_FIXES_APPLIED.md`
- **Quick Start:** `QUICK_START.md`

---

## ⚠️ Important Notes

1. **Demo credentials removed** from login page for security
2. **All functionality preserved** - nothing changed except security
3. **Default admin password MUST be changed** before production
4. **SQLite is for development** - use PostgreSQL for production

---

## 🆘 Troubleshooting

**Login not working?**
- Check backend is running on port 5000
- Verify credentials: admin@example.com / password123
- Check browser console for errors

**File upload failing?**
- Ensure file is .xlsx or .xls
- Check file size < 10MB
- Verify filename has no special characters

**API errors?**
- Check backend logs in `backend/logs/`
- Verify .env configuration
- Ensure database is initialized

---

**Version:** 3.0.0  
**Last Updated:** 2025-12-30  
**Status:** ✅ Production Ready (with proper configuration)
