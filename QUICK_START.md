# GridCast Renewables - Quick Start Guide

## ✅ Your Clean Repository is Ready!

Location: `/Users/nat/Desktop/gridcast-renewables-clean/`

This is a **clean, production-ready** version of GridCast Renewables with:
- ✅ All GridCast files only (no other projects)
- ✅ Git initialized with initial commit
- ✅ Dependencies installed
- ✅ Production build tested and working
- ✅ Ready to push to GitHub

## 🚀 Next Steps (5-10 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `gridcast-renewables`
3. Description: `Predictive Analytics Tool for U.S. Energy Independence - Solar & Wind Forecasting`
4. **Make it PUBLIC** (required for EB2-NIW)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Push to GitHub

Copy your repository URL from GitHub, then run:

```bash
cd /Users/nat/Desktop/gridcast-renewables-clean

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/gridcast-renewables.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Get Mapbox Token (Free)

1. Go to https://www.mapbox.com/
2. Sign up for free account
3. Go to Account → Tokens
4. Copy your **Default public token** (starts with `pk.`)

### Step 4: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `gridcast-renewables` repository
5. **Add Environment Variable:**
   - Name: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Value: [Your Mapbox token from Step 3]
6. Click "Deploy"

### Step 5: Update README with Live URL

Once deployed, update the README with your live URL and push to GitHub.

## 🎉 You're Ready!

**Estimated time: 15-30 minutes**

See DEPLOYMENT.md for detailed instructions.
