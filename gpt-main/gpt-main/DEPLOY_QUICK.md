# 🚀 OPEX Manager - Quick Deployment Reference

## ✅ What We've Done

1. ✅ Updated database schema to PostgreSQL
2. ✅ Created Railway deployment configuration
3. ✅ Enhanced CORS for production
4. ✅ Created environment templates
5. ✅ Pushed all changes to Git

---

## 🎯 Deploy in 5 Minutes

### Step 1: Deploy Backend (Railway)
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js backend
6. Click "+ New" → "Database" → "PostgreSQL"
7. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-min-32-chars
   CORS_ORIGIN=https://your-app.vercel.app
   ```
8. Deploy! Copy your backend URL

### Step 2: Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your repository
4. Settings:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. Deploy!

### Step 3: Update CORS
Go back to Railway → Backend → Variables:
```
CORS_ORIGIN=https://your-app.vercel.app
```
Redeploy backend.

### Step 4: Initialize Database
In Railway backend terminal:
```bash
npx prisma db push
node seed_roles_users.js
```

---

## 🔐 Default Login
- Email: admin@example.com
- Password: password123

**⚠️ CHANGE THIS IMMEDIATELY IN PRODUCTION!**

---

## 📊 Your URLs
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.railway.app
- Database: Managed by Railway

---

## 💰 Cost
- Railway: $5/month free credit
- Vercel: Free tier
- **Total: FREE** for small apps

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs
- Verify DATABASE_URL is auto-set
- Run: `npx prisma generate`

### Frontend can't connect
- Check VITE_API_URL in Vercel
- Verify CORS_ORIGIN in Railway
- Check browser console for errors

### Database errors
- Run: `npx prisma db push`
- Check PostgreSQL service status
- Verify connection string

---

## 📚 Full Documentation
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🎉 You're Ready!
Your code is pushed to Git and ready for deployment.
Follow the steps above to go live in minutes!
