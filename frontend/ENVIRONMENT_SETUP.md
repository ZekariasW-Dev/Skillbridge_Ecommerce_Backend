# Frontend Environment Setup Guide

## Environment Variables Configuration

The frontend uses environment variables to connect to the backend API. Here's how to set them up for different environments:

### Development (Local)
For local development, use `.env.local`:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=SkillBridge E-commerce (Development)
```

### Production (Netlify/Vercel/etc.)
For production deployment, use these environment variables:

**Required Variables:**
- `VITE_API_BASE_URL` = `https://skillbridge-ecommerce-backend-3.onrender.com`
- `VITE_APP_NAME` = `SkillBridge E-commerce`

**Optional Variables:**
- `VITE_UNSPLASH_ACCESS_KEY` = `your_unsplash_access_key_here` (for better product images)

## Deployment Instructions

### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add the environment variables listed above

### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the environment variables listed above

### For Other Platforms:
Set the environment variables in your deployment platform's environment configuration section.

## Important Notes:

1. **Environment Variable Prefix**: All frontend environment variables must start with `VITE_` for Vite to expose them to the client-side code.

2. **Backend URL**: Make sure the `VITE_API_BASE_URL` matches your deployed backend URL on Render.

3. **Local Development**: The `.env.local` file is ignored by git and is only for local development.

4. **Build Process**: The environment variables are embedded into the build at build time, so you need to rebuild if you change them.

## Current Configuration:

The frontend API service (`src/services/api.js`) is already configured to use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

This means it will:
- Use the environment variable if set
- Fall back to localhost:3000 for development if no environment variable is found