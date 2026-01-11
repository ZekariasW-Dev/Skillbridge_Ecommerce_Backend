# 🔧 Admin Setup Guide - How to Add Products

## Step 1: Create Admin User (Already Done ✅)

I've already created an admin user with these credentials:
- **Email**: `admin@skillbridge.com`
- **Password**: `Admin123!`
- **User ID**: `153d2c0c-77d5-4a48-96ee-b5edff7e0b46`

## Step 2: Make User Admin in MongoDB Atlas

Since the API doesn't allow role updates, you need to manually update the user role in MongoDB Atlas:

### Option A: MongoDB Atlas Web Interface
1. Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
2. Login to your MongoDB Atlas account
3. Navigate to your cluster
4. Click "Browse Collections"
5. Find the "users" collection
6. Find the user with email: `admin@skillbridge.com`
7. Click "Edit Document"
8. Change `"role": "user"` to `"role": "admin"`
9. Click "Update"

### Option B: MongoDB Compass (if you have it installed)
1. Connect to your MongoDB cluster using connection string
2. Navigate to the users collection
3. Find the admin user document
4. Edit the role field from "user" to "admin"
5. Save changes

## Step 3: Login as Admin

1. Open your frontend application: `http://localhost:3001`
2. Click "Login" in the navbar
3. Enter credentials:
   - Email: `admin@skillbridge.com`
   - Password: `Admin123!`
4. After login, you should see an "Admin" button in the navbar

## Step 4: Access Admin Dashboard

1. After logging in as admin, click the "Admin" button in the navbar
2. You'll be taken to `/admin` route
3. The Admin Dashboard will show:
   - Statistics (Revenue, Orders, Products, Low Stock)
   - Recent Orders
   - Products Management section
   - "Add Product" button

## Step 5: Add Products

### Method 1: Using the "Add Product" Button
1. In the Admin Dashboard, click the "Add Product" button (top right)
2. Fill in the product form:
   - **Product Name**: Enter product name
   - **Description**: Enter detailed description
   - **Price**: Enter price (e.g., 29.99)
   - **Stock**: Enter stock quantity (e.g., 100)
   - **Category**: Select from dropdown (electronics, clothing, books, etc.)
3. Click "Create" to save the product

### Method 2: Using the Floating Action Button
1. Scroll down in the Admin Dashboard
2. Click the blue "+" floating button (bottom right)
3. Same form will open as Method 1

## Step 6: Manage Existing Products

In the Admin Dashboard, you can:
- **Edit Products**: Click the edit icon on any product card
- **Delete Products**: Click the delete icon on any product card
- **View Product Details**: See all products in the "Products Management" section

## Troubleshooting

### If Admin Button Doesn't Appear:
1. Make sure you updated the user role to "admin" in MongoDB
2. Logout and login again to refresh the user data
3. Check browser console for any errors

### If Product Creation Fails:
1. Check that all required fields are filled
2. Make sure price is a valid number
3. Make sure stock is a positive integer
4. Check browser console for error messages

### If You Can't Access Admin Dashboard:
1. Verify you're logged in as admin
2. Try navigating directly to `/admin`
3. Check if the ProtectedRoute is working correctly

## Backend API Endpoints Used

The admin functionality uses these API endpoints:
- `POST /products` - Create new product
- `GET /products` - Get all products
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /orders` - Get all orders (for dashboard stats)

## Sample Product Data

Here's an example of what to enter when creating a product:

```
Name: "Wireless Bluetooth Headphones"
Description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals."
Price: 79.99
Stock: 50
Category: electronics
```

## Next Steps

After setting up admin access:
1. Add some sample products to test the functionality
2. Test the product editing and deletion features
3. Check that products appear correctly on the main Products page
4. Verify that customers can add products to cart and place orders

## Need Help?

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the network tab for API request failures
3. Verify the backend is running and accessible
4. Make sure MongoDB connection is working

The admin user credentials again:
- **Email**: `admin@skillbridge.com`
- **Password**: `Admin123!`