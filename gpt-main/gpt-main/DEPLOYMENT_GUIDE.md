# OPEX Manager - Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
- GitHub account with your code pushed
- Railway account (sign up at https://railway.app)

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `OPEX-Manager` repository
4. Railway will auto-detect the Node.js backend

### 1.3 Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database and set `DATABASE_URL`

### 1.4 Configure Environment Variables
Go to your backend service → **Variables** tab and add:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-change-this
PORT=5000
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

**Important:** Railway automatically provides `DATABASE_URL` - don't override it!

### 1.5 Configure Build Settings
1. Go to **Settings** → **Build**
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install && npx prisma generate && npx prisma db push`
4. Set **Start Command**: `npm start`

### 1.6 Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Copy your backend URL (e.g., `https://opex-backend.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 2.2 Import Project
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Set Environment Variable
Add this in Vercel → **Settings** → **Environment Variables**:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build
3. Your app will be live at `https://your-app.vercel.app`

---

## Step 3: Update CORS

Go back to Railway → Backend Service → Variables:

Update `CORS_ORIGIN` to your Vercel URL:
```env
CORS_ORIGIN=https://your-app.vercel.app
```

Redeploy the backend service.

---

## Step 4: Initialize Database

### 4.1 Run Migrations
In Railway backend service terminal:
```bash
npx prisma db push
```

### 4.2 Seed Initial Data
```bash
node seed_roles_users.js
```

---

## 🎉 You're Live!

Visit your Vercel URL and login with:
- **Email**: admin@example.com
- **Password**: password123

---

## 🔧 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify `DATABASE_URL` is set automatically
- Ensure Prisma generated: `npx prisma generate`

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel environment variables
- Check CORS_ORIGIN in Railway matches your Vercel URL
- Ensure backend is deployed and running

### Database errors
- Run `npx prisma db push` in Railway terminal
- Check PostgreSQL service is running
- Verify DATABASE_URL format

---

## 📊 Monitoring

### Railway Dashboard
- View logs: Service → **Deployments** → **Logs**
- Monitor metrics: **Metrics** tab
- Database access: PostgreSQL service → **Data**

### Vercel Dashboard
- View deployments: **Deployments** tab
- Check build logs: Click on deployment
- Monitor analytics: **Analytics** tab

---

## 🔄 Continuous Deployment

Both Railway and Vercel auto-deploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway and Vercel will automatically rebuild and deploy! 🚀

---

## 💰 Cost Estimate

- **Railway**: $5/month free credit (enough for small apps)
- **Vercel**: Free tier (generous limits)
- **Total**: FREE for development/small production use

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to a strong random string
- [ ] Enable HTTPS (automatic on Railway/Vercel)
- [ ] Set proper CORS_ORIGIN
- [ ] Review and limit database access
- [ ] Enable rate limiting in production
- [ ] Set up monitoring and alerts

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

---

**Need Help?** Check the logs in Railway/Vercel dashboards for detailed error messages.
