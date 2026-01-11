# 🚀 Deployment Checklist

## Backend Deployment (Render)
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI=(your MongoDB URI)
  - [ ] JWT_SECRET=(secure random string)
- [ ] Deploy and test: https://your-backend.onrender.com/health

## Frontend Deployment (Netlify)
- [ ] Update VITE_API_BASE_URL in frontend/.env.production
- [ ] Deploy to Netlify (drag & drop or GitHub)
- [ ] Test: https://your-frontend.netlify.app

## Post-Deployment
- [ ] Update CORS in app.js with your frontend URL
- [ ] Create admin user in production
- [ ] Populate production database
- [ ] Test all functionality

## Admin Access
- Email: admin@skillbridge.com
- Password: Admin123!
- Note: Set role to 'admin' in MongoDB Atlas
