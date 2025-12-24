#!/bin/bash
# Railway Deployment Script
# This script prepares the application for Railway deployment

echo "🚀 Preparing OPEX Manager for Railway Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
cd server && npm install
cd ../client && npm install

# 2. Generate Prisma Client
echo "🔧 Generating Prisma client..."
cd ../server && npx prisma generate

# 3. Build frontend
echo "🏗️  Building frontend..."
cd ../client && npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub: git push origin main"
echo "2. Go to https://railway.app and create new project"
echo "3. Connect your GitHub repository"
echo "4. Add PostgreSQL database"
echo "5. Set environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "📚 Full instructions in DEPLOYMENT_GUIDE.md"
