# GridCast Renewables - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Vercel account (free tier is sufficient)
- A Mapbox account for the mapping features

## Step 1: Prepare Your Repository

1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GridCast Renewables application"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new public repository named `gridcast-renewables`
   - Do NOT initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/gridcast-renewables.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Get Mapbox Access Token

1. Go to https://www.mapbox.com/
2. Sign up for a free account
3. Navigate to your Account page
4. Click "Create a token" or use your default public token
5. Copy the token (starts with `pk.`)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your `gridcast-renewables` repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

6. Add Environment Variable:
   - Click "Environment Variables"
   - Name: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Value: Your Mapbox token (from Step 2)
   - Environment: Production, Preview, Development (select all)

7. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variable**
   ```bash
   vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
   ```
   - Select "Production"
   - Paste your Mapbox token
   - Repeat for "Preview" and "Development"

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. Once deployed, Vercel will provide a URL (e.g., `https://gridcast-renewables.vercel.app`)
2. Open the URL in your browser
3. Test the following features:
   - ✅ Asset configuration form loads
   - ✅ Address geocoding works
   - ✅ 48-hour forecast generates (may take 10-15 seconds)
   - ✅ Long-term analysis works
   - ✅ National map displays (requires Mapbox token)

## Step 5: Update README with Live URL

1. Edit `README.md`
2. Update the badge at the top:
   ```markdown
   [![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-actual-url.vercel.app)
   ```

3. Commit and push:
   ```bash
   git add README.md
   git commit -m "Update README with live demo URL"
   git push
   ```

## Troubleshooting

### Build Fails on Vercel

**Issue**: TypeScript errors during build
- **Solution**: Run `npm run build` locally first to catch errors
- Check the Vercel build logs for specific errors

**Issue**: Module not found errors
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` and commit `package-lock.json`

### National Map Not Loading

**Issue**: Map shows error or doesn't load
- **Solution**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set in Vercel environment variables
- Check browser console for Mapbox authentication errors
- Ensure token starts with `pk.` (public token)

### API Routes Timeout

**Issue**: Forecast generation takes too long
- **Solution**: Vercel serverless functions have a 10-second timeout on free tier
- Consider upgrading to Pro for 60-second timeout
- Or optimize API calls (already implemented with parallel requests)

### CORS Errors

**Issue**: API calls fail with CORS errors
- **Solution**: This shouldn't happen with Next.js API routes
- If it does, check that you're using relative URLs (`/api/forecast` not `http://localhost:3000/api/forecast`)

## Performance Optimization

### Enable Edge Functions (Optional)

For faster global response times, you can deploy API routes to Vercel Edge:

1. Update `app/api/forecast/route.ts`:
   ```typescript
   export const runtime = 'edge';
   ```

2. Repeat for other API routes
3. Redeploy

**Note**: Edge runtime has some limitations (no Node.js APIs)

### Enable Caching

API responses can be cached for better performance:

```typescript
export const revalidate = 3600; // Cache for 1 hour
```

Add this to API route files where appropriate.

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update README with new URL

## Monitoring

Vercel provides built-in analytics:
- Go to your project dashboard
- Click "Analytics" to see:
  - Page views
  - API route performance
  - Error rates
  - Geographic distribution

## Cost Considerations

**Free Tier Limits** (Vercel Hobby):
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- 6,000 minutes build time/month

For GridCast Renewables, the free tier should be sufficient for:
- ~10,000 forecast requests/month
- ~50,000 page views/month

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use environment variables** - Already configured
3. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

## Next Steps

After successful deployment:

1. ✅ Test all features on production URL
2. ✅ Update README.md with live demo link
3. ✅ Share the project on LinkedIn, GitHub, etc.
4. ✅ Include in your EB2-NIW petition documentation
5. ✅ Consider adding Google Analytics for usage tracking
6. ✅ Monitor Vercel analytics for performance insights

## Support

For issues:
- Check Vercel build logs
- Review browser console for client-side errors
- Check API route logs in Vercel dashboard
- Open an issue on GitHub repository

---

**Congratulations!** Your GridCast Renewables application is now live and accessible worldwide! 🎉

