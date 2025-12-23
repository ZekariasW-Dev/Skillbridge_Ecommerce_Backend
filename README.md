# E-commerce Platform API

A complete RESTful API backend for an E-commerce Platform built with Node.js and Express.js.

## Features

- User authentication (register/login) with JWT
- Product management (CRUD operations)
- Order management with transaction support
- Role-based access control (Admin/User)
- Input validation and error handling
- Standardized API responses
- SQLite database with proper relationships

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   └── utils/
│       ├── helper.js
│       ├── responses.js
│       └── validation.js
├── app.js
├── server.js
├── setup-admin.js
├── package.json
├── .env.example
└── README.md
```

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```
   PORT=3000
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   NODE_ENV=development
   ```

4. **MongoDB Atlas Setup**
   The application is configured to use MongoDB Atlas cloud database. The connection string is already configured in the `.env` file. No local MongoDB installation is required.

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `MONGODB_URI` | MongoDB Atlas connection string | Your Atlas cluster URI |
| `NODE_ENV` | Environment mode | development |

## API Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```

#### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```

### Products

#### Get All Products (Public)
- **GET** `/products?page=1&limit=10&search=keyword`

#### Get Product by ID (Public)
- **GET** `/products/:id`

#### Create Product (Admin Only)
- **POST** `/products`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stock": 100,
    "category": "Electronics"
  }
  ```

#### Update Product (Admin Only)
- **PUT** `/products/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Product (Admin Only)
- **DELETE** `/products/:id`
- **Headers:** `Authorization: Bearer <token>`

### Orders

#### Create Order (Authenticated)
- **POST** `/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
  ```

#### Get My Orders (Authenticated)
- **GET** `/orders`
- **Headers:** `Authorization: Bearer <token>`

## Response Format

All API responses follow a standardized format:

### Standard Response
```json
{
  "success": boolean,
  "message": string,
  "object": object | null,
  "errors": string[] | null
}
```

### Paginated Response
```json
{
  "success": boolean,
  "message": string,
  "object": object[],
  "pageNumber": number,
  "pageSize": number,
  "totalSize": number,
  "errors": string[] | null
}
```

## Validation Rules

### User Registration
- **Username:** Alphanumeric only, required, unique
- **Email:** Valid email format, required, unique
- **Password:** Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character

### Product Creation
- **Name:** 3-100 characters, required
- **Description:** Minimum 10 characters, required
- **Price:** Positive number, required
- **Stock:** Non-negative integer, required
- **Category:** Required

## Database Schema

### Users Collection
- `id` (UUID, Unique)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (String, Default: 'user')
- `createdAt` (DateTime)

### Products Collection
- `id` (UUID, Unique)
- `name` (String)
- `description` (String)
- `price` (Number)
- `stock` (Integer)
- `category` (String)
- `userId` (UUID, Reference to User)
- `createdAt` (DateTime)

### Orders Collection
- `id` (UUID, Unique)
- `userId` (UUID, Reference to User)
- `description` (String)
- `totalPrice` (Number)
- `status` (String, Default: 'pending')
- `products` (Array of embedded order items)
  - `productId` (UUID)
  - `name` (String)
  - `description` (String)
  - `quantity` (Integer)
  - `price` (Number)
- `createdAt` (DateTime)

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400 Bad Request)
- Authentication errors (401 Unauthorized)
- Authorization errors (403 Forbidden)
- Resource not found errors (404 Not Found)
- Server errors (500 Internal Server Error)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- MongoDB transactions for data consistency
- Unique indexes for data integrity
- CORS configuration

## Testing

Health check endpoint:
```bash
curl http://localhost:3000/health
```

## License

MIT License