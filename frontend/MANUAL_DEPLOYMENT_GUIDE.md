# Manual Deployment Guide for Netlify

## Step 1: Set Environment Variables for Production

Create a `.env.production` file in the frontend directory with:
```
VITE_API_BASE_URL=https://skillbridge-ecommerce-backend-3.onrender.com
VITE_APP_NAME=SkillBridge E-commerce
```

## Step 2: Build the Frontend

Run these commands in the frontend directory:

```bash
cd frontend
npm install
npm run build
```

This will create a `dist` folder with all the built files.

## Step 3: Manual Upload to Netlify

1. Go to [netlify.com](https://netlify.com) and log in
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the entire `frontend/dist` folder to the deployment area
4. Wait for deployment to complete
5. Your site will be live at a Netlify URL (like `https://amazing-site-name.netlify.app`)

## Step 4: Configure Redirects (Important!)

Since this is a Single Page Application (SPA), you need to handle client-side routing.

Create a file `frontend/public/_redirects` with this content:
```
/*    /index.html   200
```

Then rebuild and redeploy:
```bash
npm run build
```

Upload the new `dist` folder to Netlify again.

## Environment Variables Check

Your frontend is configured to use:
- `VITE_API_BASE_URL` for the backend URL
- Falls back to `http://localhost:3000` if not set

The API service will automatically use your deployed backend on Render.

## Quick Commands Summary

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done already)
npm install

# Build for production
npm run build

# The dist folder is ready for manual upload to Netlify
```