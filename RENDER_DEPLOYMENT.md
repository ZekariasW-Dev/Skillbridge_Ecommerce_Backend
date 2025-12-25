# 🚀 Render Deployment Guide

## Step-by-Step Deployment Instructions

### 1. **Prepare Your Repository**
✅ Your code is already committed to GitHub
✅ All deployment files are created

### 2. **Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3. **Deploy to Render**

#### Option A: Using Render Dashboard (Recommended)
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Skillbridge_Ecommerce_Backend`
   - Choose the `main` branch

2. **Configure Service Settings**
   ```
   Name: ecommerce-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   Add these in the Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_super_secure_production_jwt_secret_key_minimum_32_characters_long
   ```

   Optional (for image upload):
   ```
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

#### Option B: Using render.yaml (Infrastructure as Code)
1. The `render.yaml` file is already created in your repository
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository and select `render.yaml`
4. Set the environment variables as described above

### 4. **Verify Deployment**

Once deployed, your API will be available at:
```
https://your-service-name.onrender.com
```

Test the endpoints:
```bash
# Health check
curl https://your-service-name.onrender.com/health

# API info
curl https://your-service-name.onrender.com/

# Register a user
curl -X POST https://your-service-name.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'
```

### 5. **Post-Deployment Setup**

1. **Create Admin User**
   - You can create an admin user by calling the registration endpoint with admin privileges
   - Or modify the registration endpoint temporarily to create an admin user

2. **Test All Endpoints**
   - Use the Postman collection in `/docs/` folder
   - Test authentication, product management, and order placement

### 6. **Production Considerations**

#### Security
- ✅ Environment variables are secure
- ✅ JWT secrets are production-ready
- ✅ Database connection is encrypted
- ✅ Rate limiting is enabled

#### Performance
- ✅ Caching is enabled
- ✅ Database indexes are created
- ✅ Connection pooling is configured

#### Monitoring
- ✅ Health check endpoint available
- ✅ Logging is configured
- ✅ Error handling is comprehensive

### 7. **Troubleshooting**

#### Common Issues:
1. **Build Fails**: Check Node.js version compatibility
2. **Database Connection**: Verify MongoDB URI and network access
3. **Environment Variables**: Ensure all required variables are set
4. **Port Issues**: Render automatically assigns PORT, don't hardcode it
5. **SSL/TLS Errors**: Common on cloud platforms, connection will retry automatically

#### SSL/TLS Connection Issues:
If you see errors like:
```
❌ MongoDB connection failed: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

**Solutions:**
1. **Use the updated MongoDB URI format** (includes `ssl=true&authSource=admin`)
2. **Wait for automatic retry** - The connection has built-in retry logic
3. **Check MongoDB Atlas Network Access** - Ensure `0.0.0.0/0` is allowed
4. **Verify MongoDB Atlas Cluster** - Ensure it's running and accessible

#### Debug Commands:
```bash
# Check logs in Render dashboard
# View environment variables
# Test database connection
```

### 8. **Custom Domain (Optional)**
1. Go to your service settings in Render
2. Add your custom domain
3. Configure DNS records as instructed

## 🎉 Success!

Your E-commerce API is now deployed and accessible worldwide!

**Live API URL**: `https://your-service-name.onrender.com`

### Available Endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /products` - Get products
- `POST /products` - Create product (Admin)
- `GET /orders` - Get orders
- `POST /orders` - Place order
- `GET /health` - Health check

**🚀 Your E-commerce API is now live on Render!**