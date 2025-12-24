# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure Cloudinary credentials (if using image upload)
- [ ] Set appropriate PORT (default: 3000)

### 2. Security Configuration
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting for production traffic
- [ ] Configure secure headers

### 3. Database Setup
- [ ] Production MongoDB Atlas cluster configured
- [ ] Database indexes created
- [ ] Admin user created (`npm run setup-admin`)
- [ ] Database backup strategy implemented

### 4. Server Configuration
- [ ] Reverse proxy (nginx) configured
- [ ] Process manager (PM2) configured
- [ ] Log rotation configured
- [ ] Monitoring and alerting set up

## 🔧 Deployment Commands

### Quick Production Setup
```bash
# 1. Install dependencies
npm install --production

# 2. Set environment variables
export NODE_ENV=production
export MONGODB_URI="your-production-mongodb-uri"
export JWT_SECRET="your-secure-jwt-secret"

# 3. Create admin user
npm run setup-admin

# 4. Start production server
npm start
```

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "ecommerce-api" --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Production Monitoring

### Health Checks
- `GET /health` - Server health status
- `GET /` - API information and endpoints

### Performance Monitoring
- Response times
- Error rates
- Database connection status
- Memory and CPU usage

### Log Monitoring
- Application logs
- Error logs
- Access logs
- Security logs

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use secure secrets management
- Rotate JWT secrets regularly
- Monitor for exposed credentials

### API Security
- Rate limiting enabled
- Input validation active
- CORS properly configured
- HTTPS enforced

### Database Security
- Connection string secured
- Database user permissions limited
- Regular security updates
- Backup encryption enabled

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple server instances
- Session management (stateless JWT)
- Database connection pooling

### Performance Optimization
- Caching strategy
- CDN for static assets
- Database query optimization
- Image optimization

## 🆘 Troubleshooting

### Common Issues
1. **Server won't start**: Check environment variables
2. **Database connection failed**: Verify MongoDB URI and network access
3. **Authentication issues**: Check JWT secret configuration
4. **Image upload fails**: Verify Cloudinary configuration

### Debug Commands
```bash
# Check server status
curl http://localhost:3000/health

# Test authentication
npm run test-login

# Verify API endpoints
npm run test-api

# Run comprehensive tests
npm run final-test
```

## ✅ Production Verification

After deployment, verify:
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Database operations successful
- [ ] Image upload functional (if configured)
- [ ] Rate limiting active
- [ ] Error handling working
- [ ] Logs being generated

## 📞 Support

For deployment issues:
1. Check server logs
2. Verify environment configuration
3. Test database connectivity
4. Review security settings

---

**🎉 Your E-commerce API is production-ready!**