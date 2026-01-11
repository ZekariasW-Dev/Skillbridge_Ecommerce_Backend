# Automatic Netlify Deployment Guide

## Step 1: Prepare Your Repository

Your repository is already set up with the necessary files:
- ✅ `frontend/netlify.toml` - Netlify configuration
- ✅ `frontend/public/_redirects` - SPA routing
- ✅ `frontend/.env.production` - Production environment variables

## Step 2: Set Up Netlify Automatic Deployment

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Log in to your account

2. **Connect Your Repository**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select your repository: `ZekariasW-Dev/Skillbridge_Ecommerce_Backend`

3. **Configure Build Settings**
   Netlify should automatically detect the settings from `netlify.toml`, but verify:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables, add:
   ```
   VITE_API_BASE_URL = https://skillbridge-ecommerce-backend-3.onrender.com
   VITE_APP_NAME = SkillBridge E-commerce
   ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your frontend
   - You'll get a URL like `https://amazing-site-name.netlify.app`

## Step 3: Automatic Updates

Now whenever you push changes to your GitHub repository:
1. Netlify automatically detects the changes
2. Builds the frontend with your environment variables
3. Deploys the updated site
4. Your site is live with the latest changes

## Environment Variables Summary

**For Netlify (Production):**
- `VITE_API_BASE_URL` = `https://skillbridge-ecommerce-backend-3.onrender.com`
- `VITE_APP_NAME` = `SkillBridge E-commerce`

**For Render (Backend):**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MONGODB_URI` = `mongodb+srv://zekarias:zekarias2026@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority`
- `JWT_SECRET` = `super_secure_production_jwt_secret_key_change_this_to_something_very_long_and_random_for_maximum_security`

## Important Notes

1. **CORS Configuration**: Make sure your backend allows requests from your Netlify domain
2. **Environment Variables**: They must start with `VITE_` for the frontend
3. **Build Process**: Netlify will run `npm install` and `npm run build` automatically
4. **Domain**: You can set up a custom domain in Netlify settings if needed

## Troubleshooting

- **Build fails**: Check the build logs in Netlify dashboard
- **API not connecting**: Verify the `VITE_API_BASE_URL` environment variable
- **404 errors**: The `netlify.toml` file handles SPA routing
- **CORS errors**: Update your backend CORS configuration to include your Netlify domain