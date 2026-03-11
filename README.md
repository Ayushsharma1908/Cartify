# Cartify

A full-stack e-commerce web application built with React and Node.js. Browse products, add to cart, checkout with Stripe, and manage orders. Supports both email/password and Google sign-in.

![Cartify](https://img.shields.io/badge/Cartify-E--Commerce-blue)

---

## Features

- **Product catalog** – Browse by category, search, sort, and filter
- **Authentication** – Email/password signup & login, Google OAuth via Supabase
- **Shopping cart** – Add, update, remove items; persists across sessions
- **Wishlist** – Save products for later
- **Checkout** – Stripe payment integration
- **Order management** – View order history and status
- **User profile** – Update profile, manage addresses
- **Responsive UI** – Tailwind CSS, mobile-friendly layout

---

## Tech Stack

| Layer      | Technology                        |
|-----------|------------------------------------|
| Frontend  | React 18, React Router, Zustand   |
| Styling   | Tailwind CSS, CRACO               |
| Backend   | Node.js, Express                  |
| Database  | MongoDB (Mongoose)                |
| Auth      | JWT, Supabase (Google OAuth)      |
| Payments  | Stripe                            |

---

## Project Structure

```
cartify/
├── frontend/                 # React app
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── store/            # Zustand state
│   │   └── lib/              # Utilities (Supabase client)
│   └── package.json
├── backend/                  # Express API
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, validation
│   ├── scripts/              # Seed scripts
│   └── package.json
├── package.json              # Root scripts
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (or 16+ with `NODE_OPTIONS=--openssl-legacy-provider` for CRA)
- **MongoDB** (local or Atlas)
- **Stripe** account (for payments)
- **Supabase** account (for Google auth, optional)

---

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd cartify
npm run install-all
```

Or install manually:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Environment variables

**Backend** (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cartify
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLIENT_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Optional: for Google sign-in
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Ensure `REACT_APP_API_URL` uses the same port as backend `PORT`.

---

## Running the project

### Option 1: Run both (from root)

```bash
npm run dev
```

### Option 2: Run separately

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm start
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000/api  

---

## Seed products

Populate sample products (across all categories):

```bash
cd backend
npm run seed
```

Or call the API (no auth required):

```bash
curl -X POST http://localhost:5000/api/products/seed
```

---

## Google sign-in (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers** → Enable **Google**.
3. In Google Cloud Console, add this redirect URI:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Add **Client ID** and **Client Secret** in Supabase.
5. Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` to `frontend/.env`.

---

## Stripe setup

1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
2. Add `STRIPE_SECRET_KEY` to `backend/.env` and `REACT_APP_STRIPE_PUBLIC_KEY` to `frontend/.env`.
3. (Optional) Configure a webhook for `api/payment/webhook` for production.

---

## API overview

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | /api/health        | Health check       |
| POST   | /api/auth/register | Register           |
| POST   | /api/auth/login    | Login              |
| POST   | /api/auth/google   | Google auth (JWT)  |
| GET    | /api/products      | List products      |
| GET    | /api/products/:id  | Product detail     |
| POST   | /api/products/seed | Seed products      |
| POST   | /api/cart/add      | Add to cart        |
| POST   | /api/orders        | Create order       |
| POST   | /api/payment/create-intent | Stripe intent |

---

## Scripts

| Command              | Description                    |
|----------------------|--------------------------------|
| `npm run install-all`| Install backend + frontend     |
| `npm run dev`        | Run backend + frontend         |
| `npm run start:backend`  | Run backend only           |
| `npm run start:frontend` | Run frontend only          |
| `npm run seed` (in backend) | Seed sample products   |

---

## Troubleshooting

- **OpenSSL error** – Use Node 18+ or run frontend with:  
  `cross-env NODE_OPTIONS=--openssl-legacy-provider npm start`
- **CORS errors** – Ensure backend `CLIENT_URL` and CORS origins match the frontend URL.
- **Port in use** – Change `PORT` in `backend/.env` and `REACT_APP_API_URL` in `frontend/.env` accordingly.
- **Connection refused** – Confirm backend and MongoDB are running.

---

## License

MIT
