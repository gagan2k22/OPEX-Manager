# 🔐 OPEX Manager - Security Configuration Guide

## ⚠️ CRITICAL: First-Time Setup

### 1. Change Default Admin Password

**IMPORTANT:** The default admin password must be changed immediately after first deployment.

**Default Credentials (CHANGE IMMEDIATELY):**
- Email: `admin@example.com`
- Password: `password123`

**Steps to Change:**
1. Login with default credentials
2. Navigate to User Management
3. Edit the admin user
4. Set a strong password meeting these requirements:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 digit
   - At least 1 special character

### 2. Environment Variables

**Critical Security Settings in `.env`:**

```bash
# JWT Secret - MUST be unique and secure (64+ characters)
JWT_SECRET="<your-secure-random-string-here>"

# Session Secret - MUST be unique and secure (64+ characters)
SESSION_SECRET="<your-secure-random-string-here>"

# CORS Origin - Set to your actual frontend URL
CORS_ORIGIN="https://yourdomain.com"

# Environment - Set to 'production' for deployment
NODE_ENV=production
```

**Generate Secure Secrets:**
```python
import secrets
print("JWT_SECRET:", secrets.token_urlsafe(64))
print("SESSION_SECRET:", secrets.token_urlsafe(64))
```

### 3. HTTPS Configuration

**For Production Deployment:**
- HTTPS is MANDATORY
- Use a valid SSL/TLS certificate
- Configure your reverse proxy (nginx/Apache) to enforce HTTPS
- The application includes HSTS headers for additional security

### 4. Database Security

**SQLite (Development Only):**
- Current setup uses SQLite
- **NOT recommended for production**

**PostgreSQL (Production Recommended):**
```bash
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/opex_db
```

### 5. Rate Limiting

**Current Configuration:**
- Login: 5 attempts per minute per IP
- API: 100 requests per minute per IP

**To Adjust:**
Edit `backend/app/middleware/rate_limiter.py`

### 6. File Upload Security

**Restrictions:**
- Allowed file types: `.xlsx`, `.xls`
- Maximum file size: 10MB
- Filename sanitization enabled
- Path traversal protection enabled

### 7. Password Policy

**Enforced Requirements:**
- Minimum length: 8 characters
- Must contain: uppercase, lowercase, digit, special character

**To Modify:**
Edit `backend/app/utils/security.py` → `SecurityConfig` class

### 8. Session Management

**JWT Token Settings:**
- Expiration: 2 hours (120 minutes)
- Algorithm: HS256
- Refresh token: 7 days

**To Modify:**
Edit `backend/app/utils/security.py` → `SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES`

## 🛡️ Security Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, User, Viewer)
- Password hashing with bcrypt
- Rate limiting on login

✅ **Input Validation**
- SQL injection protection via ORM
- LIKE wildcard escaping
- XSS protection (React default)
- File upload validation
- Path traversal prevention

✅ **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Referrer-Policy

✅ **Data Protection**
- Password strength validation
- Sensitive data sanitization in logs
- Audit logging for admin actions

✅ **Error Handling**
- Generic error messages (no information disclosure)
- Comprehensive exception handling
- Detailed logging for debugging

## 🚨 Security Checklist Before Deployment

- [ ] Changed default admin password
- [ ] Generated unique JWT_SECRET (64+ characters)
- [ ] Generated unique SESSION_SECRET (64+ characters)
- [ ] Updated CORS_ORIGIN to production URL
- [ ] Set NODE_ENV=production
- [ ] Configured HTTPS/SSL certificate
- [ ] Migrated from SQLite to PostgreSQL (if production)
- [ ] Reviewed and adjusted rate limits
- [ ] Tested password policy enforcement
- [ ] Verified file upload restrictions
- [ ] Enabled application monitoring
- [ ] Set up automated backups
- [ ] Configured firewall rules
- [ ] Reviewed user permissions
- [ ] Tested disaster recovery plan

## 📞 Security Incident Response

**If you suspect a security breach:**

1. **Immediate Actions:**
   - Disable affected user accounts
   - Rotate JWT secrets
   - Review audit logs
   - Check for unauthorized access

2. **Investigation:**
   - Review `backend/logs/` for suspicious activity
   - Check database for unauthorized changes
   - Analyze network traffic

3. **Recovery:**
   - Restore from backup if needed
   - Reset all user passwords
   - Update security configurations
   - Apply security patches

## 🔄 Regular Security Maintenance

**Weekly:**
- Review audit logs for suspicious activity
- Check for failed login attempts
- Monitor rate limit violations

**Monthly:**
- Update dependencies (`npm audit`, `pip check`)
- Review user accounts and permissions
- Test backup restoration
- Security scan with automated tools

**Quarterly:**
- Rotate JWT secrets
- Review and update security policies
- Conduct security training
- Penetration testing (if applicable)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://react.dev/learn/security)

## ⚖️ Compliance

This application implements security controls aligned with:
- OWASP Top 10 recommendations
- GDPR data protection principles
- SOC 2 security requirements

---

**Last Updated:** 2025-12-30  
**Version:** 3.0.0
