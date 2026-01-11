# SkillBridge E-commerce Frontend

A modern React frontend for the SkillBridge E-commerce platform built with Vite, Material-UI, and React Router.

## 🚀 Features

### Core Features
- **User Authentication** - Register, login, logout with JWT
- **Product Catalog** - Browse products with search and filtering
- **Shopping Cart** - Add/remove items, update quantities
- **Order Management** - Place orders and view order history
- **Responsive Design** - Works on desktop, tablet, and mobile

### Admin Features
- **Admin Dashboard** - Overview of sales, orders, and products
- **Product Management** - Create, edit, delete products
- **Order Tracking** - View and manage customer orders
- **Analytics** - Revenue and inventory insights

### Enhanced Features
- **Global Images** - Uses Unsplash and Picsum for product images
- **Real-time Notifications** - Toast notifications for user actions
- **Advanced Search** - Filter by category, price, and name
- **Persistent Cart** - Cart items saved in localStorage
- **Professional UI** - Material-UI components with custom theme

## 🛠 Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Professional React components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form validation and handling
- **React Hot Toast** - Beautiful notifications

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=https://skillbridge-ecommerce-backend-3.onrender.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `VITE_API_BASE_URL`: Your backend API URL

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository

3. **Set environment variables in Netlify dashboard**

## 📱 Pages and Components

### Pages
- **Home** - Hero section, featured products, categories
- **Products** - Product catalog with search and filters
- **Login/Register** - User authentication
- **Cart** - Shopping cart with checkout
- **Orders** - Order history and tracking
- **Admin Dashboard** - Product and order management

### Components
- **Navbar** - Navigation with cart counter and user menu
- **ProductCard** - Product display with add to cart
- **CartItem** - Cart item with quantity controls
- **ProductForm** - Admin form for creating/editing products
- **ProtectedRoute** - Route protection for authenticated users

## 🎨 Design Features

- **Modern UI** - Clean, professional design with Material-UI
- **Responsive Layout** - Works on all screen sizes
- **Loading States** - Skeleton loading and spinners
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback for user actions

## 🔗 API Integration

The frontend connects to the backend API at:
- **Production**: https://skillbridge-ecommerce-backend-3.onrender.com
- **Local Development**: http://localhost:3000

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /products` - Get products with filtering
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)
- `GET /orders` - Get user orders
- `POST /orders` - Create order
- `GET /health` - Health check

## 🖼 Image Service

Uses global image services instead of local images:
- **Product Images**: Picsum Photos (Lorem Picsum)
- **Category Images**: Unsplash
- **Hero Images**: Unsplash
- **User Avatars**: DiceBear Avatars
- **Placeholders**: Placeholder.com

## 🔐 Authentication

- JWT token stored in localStorage
- Automatic token refresh on API calls
- Protected routes for authenticated users
- Admin-only routes for admin users

## 📊 State Management

- **React Context** for global state
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **localStorage** - Persistent cart and user data

## 🎯 Performance Features

- **Code Splitting** - Lazy loading of routes
- **Image Optimization** - Responsive images with proper sizing
- **Caching** - API response caching
- **Bundle Optimization** - Vite's optimized bundling

## 🧪 Testing

Run tests with:
```bash
npm run test
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

---

Built with ❤️ using React and Material-UI