# 🛍️ Cartify — Full-Stack E-Commerce Platform

A production-ready e-commerce app built with **React.js**, **Node.js**, **Express.js**, **MongoDB**, **JWT Auth**, and **Stripe Payments**.

---

## 📁 Project Structure

```
cartify/
├── backend/           ← Node.js + Express API
│   ├── models/        ← Mongoose schemas (User, Product, Cart, Order)
│   ├── routes/        ← REST API routes
│   ├── middleware/    ← JWT auth middleware
│   ├── server.js      ← Express app entry point
│   └── .env.example   ← Environment variable template
│
└── frontend/          ← React.js app
    ├── src/
    │   ├── components/ ← Reusable UI components
    │   ├── pages/      ← Route-level pages
    │   ├── store/      ← Zustand state management
    │   └── services/   ← Axios API calls
    └── .env.example
```

---

## ⚙️ Prerequisites

Before starting, make sure you have installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18+ | https://nodejs.org |
| **MongoDB** | v6+ | https://www.mongodb.com/try/download/community |
| **npm** | v9+ | Comes with Node.js |

---

## 🚀 Step-by-Step Setup

### STEP 1 — Clone / Open the project

```bash
# Navigate into the project folder
cd cartify
```

---

### STEP 2 — Get Stripe API Keys (Free)

1. Go to https://stripe.com and create a free account
2. In the dashboard, go to **Developers → API Keys**
3. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

---

### STEP 3 — Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install all backend packages
npm install
```

**Packages being installed:**
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken` — JWT authentication
- `bcryptjs` — Password hashing
- `stripe` — Payment processing
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — Environment variables
- `express-validator` — Input validation
- `morgan` — HTTP request logger
- `nodemon` — Auto-restart for development

**Create your .env file:**

```bash
# Copy the example file
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cartify
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
CLIENT_URL=http://localhost:3000
```

---

### STEP 4 — Setup Frontend

```bash
# Open a NEW terminal tab/window
# Navigate to frontend folder
cd cartify/frontend

# Install all frontend packages
npm install
```

**Packages being installed:**
- `react`, `react-dom` — React core
- `react-router-dom` — Client-side routing
- `axios` — HTTP client
- `zustand` — State management
- `react-icons` — Icon library
- `react-hot-toast` — Toast notifications
- `@stripe/stripe-js`, `@stripe/react-stripe-js` — Stripe payment UI
- `tailwindcss` — Utility CSS framework

**Create your .env file:**

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

---

### STEP 5 — Start MongoDB

**On Windows:**
```bash
# Open Services and start MongoDB, OR run:
mongod
```

**On macOS:**
```bash
brew services start mongodb-community
# OR
mongod --dbpath /usr/local/var/mongodb
```

**On Linux:**
```bash
sudo systemctl start mongod
```

---

### STEP 6 — Run the App

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd cartify/backend
npm run dev        # Uses nodemon for auto-reload
```

You should see:
```
✅ MongoDB connected successfully
🚀 Cartify server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd cartify/frontend
npm start
```

The app opens automatically at: **http://localhost:3000**

---

### STEP 7 — Seed Sample Products (Optional)

To populate your database with sample products:

1. Register an account and set your user role to `admin` in MongoDB Compass (or via mongo shell: `db.users.updateOne({email:"your@email.com"}, {$set:{role:"admin"}})`)
2. Use Postman or curl to hit:
```
POST http://localhost:5000/api/products/admin/seed
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing Stripe Payments

Use these test card details in checkout:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g., `12/28`) |
| CVV | Any 3 digits (e.g., `123`) |
| ZIP | Any 5 digits (e.g., `12345`) |

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (🔒) |
| PUT | `/api/auth/profile` | Update profile (🔒) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (🔒 Admin) |
| POST | `/api/products/:id/review` | Add review (🔒) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user cart (🔒) |
| POST | `/api/cart/add` | Add item to cart (🔒) |
| PUT | `/api/cart/update` | Update quantity (🔒) |
| DELETE | `/api/cart/remove/:id` | Remove item (🔒) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order (🔒) |
| GET | `/api/orders/my-orders` | Get my orders (🔒) |
| GET | `/api/orders/:id` | Get order details (🔒) |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-intent` | Create Stripe payment intent (🔒) |
| POST | `/api/payment/confirm/:orderId` | Confirm payment (🔒) |

🔒 = Requires JWT token in `Authorization: Bearer <token>` header

---

## 🔑 Key Features

- **JWT Authentication** — Secure login/register with HTTP-only token storage
- **Stripe Payments** — Real card processing (test mode) with payment intents
- **Cart Management** — Persistent cart synced to MongoDB
- **Product Filters** — Search, filter by category/price/rating, sort, paginate
- **Wishlist** — Save favorite products
- **Order Tracking** — Visual step-by-step order status tracker
- **Reviews** — Verified purchase reviews with star ratings
- **Responsive Design** — Works on mobile, tablet, desktop
- **Admin Role** — Product/order management for admin users

---

## 🐛 Common Issues & Fixes

**MongoDB connection error:**
- Make sure MongoDB service is running
- Check your `MONGO_URI` in `.env`

**CORS error:**
- Verify `CLIENT_URL` in backend `.env` matches frontend port

**Stripe payment not working:**
- Double-check you copied the correct keys (test keys start with `pk_test_` and `sk_test_`)
- Use the test card `4242 4242 4242 4242`

**Module not found errors:**
- Run `npm install` again in the affected folder
- Delete `node_modules` folder and `package-lock.json`, then `npm install`

---

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build

# The /build folder is ready to deploy to Vercel, Netlify, etc.
# Deploy backend to Railway, Render, or any Node.js host
```

---

Built with ❤️ using React, Node.js, Express, MongoDB & Stripe
