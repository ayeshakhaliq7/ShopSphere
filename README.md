# ShopSphere

A full-stack e-commerce web application built with the **MERN stack** (MongoDB, Express, React, Node.js). ShopSphere is a portfolio project that demonstrates end-to-end product development: authentication, a real REST API, database modelling, a responsive storefront, and an admin dashboard for managing products, orders, and users.

> Shop smarter. Find better. Delivered to your door.

## Screenshots

![Home](docs/Home.png) ![Shop](docs/Shop%20page.png) ![Product Details](docs/Product%20details.png) ![Cart](docs/cart.png) ![Checkout](docs/checkout.png) ![Admin Dashboard](docs/dashboard.png) 

```
doc/
  home.png
  shop.png
  product-details.png
  cart.png
  checkout.png
  dashboard.png
```

## Features

**Storefront**
- Responsive, modern UI with hover states, skeleton loaders, toasts, and empty/error states
- Home page with hero, categories, featured & trending products, promo banner, reviews, newsletter signup
- Product search, category/price/rating/availability filters, and sorting, with pagination
- Product details page with an image gallery, quantity selector, related products, and customer reviews
- Persistent shopping cart (per browser) with live subtotal/shipping/total
- Wishlist, tied to the signed-in account
- Multi-step checkout with a clearly labelled **demo** payment flow (no real payments are processed)
- Order confirmation, order history, and order detail pages with a cancel option for pending orders

**Accounts**
- Registration and login with JWT authentication and bcrypt password hashing
- Persistent login (session restored from a stored token) and protected routes
- Profile, order history, and account settings (update name/email/password)

**Admin dashboard** (role-protected)
- Overview cards: total sales, orders, products, users
- Revenue and order charts for the last 6 months
- Recent orders table
- Full product management: create, edit, delete, update stock/price/discount/category
- Order management: view all orders, update status (Pending → Processing → Shipped → Delivered, or Cancelled)
- User management: view users, activate/deactivate accounts
- Tables collapse into cards on mobile

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, Context API, Vite |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Security | helmet, express-rate-limit, express-validator, CORS |

## Project structure

```
ShopSphere/
  client/                 React frontend (Vite)
    src/
      components/         Reusable UI components
      pages/               Route-level pages (+ pages/admin)
      layouts/             Main + admin shell layouts
      context/             Auth, Cart, Wishlist, Toast providers
      services/            Axios instance + API service functions
      hooks/               useFetch, useDocumentTitle
      utils/               Formatting helpers
  server/                 Express backend
    config/                Database connection
    models/                Mongoose schemas
    controllers/           Route handlers / business logic
    routes/                REST API routes
    middleware/             Auth, validation, error handling
    utils/                 Helpers + database seed script
  .env.example            Environment variable template
```

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB database — either [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Environment variables

Copy `.env.example` and create two files:

```bash
# server/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files — only `.env.example` is tracked.

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed the database

Populates 6 categories, 24 products, 6 users (1 admin + 5 customers), reviews, and ~36 sample orders spread across the last six months (so the admin charts have data).

```bash
cd server
npm run seed
# to wipe all ShopSphere data: npm run seed:destroy
```

### 4. Run the backend

```bash
cd server
npm run dev      # nodemon, restarts on change
# or: npm start
```

API runs at `http://localhost:5000`, health check at `GET /api/health`.

### 5. Run the frontend

```bash
cd client
npm run dev
```

App runs at `http://localhost:5173`.

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopsphere.com | Admin@123 |
| Customer | jane@example.com | User@1234 |

## API overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`; admin routes additionally require the signed-in user to have `role: "admin"`.

```
Auth
  POST   /auth/register
  POST   /auth/login
  GET    /auth/me                     (protected)

Products
  GET    /products                    ?search&category&minPrice&maxPrice&rating&inStock&featured&sort&page&limit
  GET    /products/:id
  POST   /products                    (admin)
  PUT    /products/:id                (admin)
  DELETE /products/:id                (admin)
  GET    /products/:id/reviews
  POST   /products/:id/reviews        (protected)

Categories
  GET    /categories
  POST   /categories                  (admin)

Orders                                 (all protected)
  POST   /orders
  GET    /orders                       ?scope=all&status=      (scope=all is admin-only)
  GET    /orders/:id
  PUT    /orders/:id/cancel
  PUT    /orders/:id/status            (admin)

Users                                  (all protected)
  GET    /users                        (admin)
  GET    /users/:id
  PUT    /users/:id
  GET    /users/wishlist
  POST   /users/wishlist/:productId
  DELETE /users/wishlist/:productId

Admin
  GET    /admin/stats                  (admin)

Newsletter
  POST   /newsletter
```

Prices and stock for an order are always resolved server-side from the database — the client only sends product IDs and quantities, so totals can't be tampered with.

## Database setup

MongoDB collections are created automatically by Mongoose the first time documents are written (i.e. when you run `npm run seed`). No manual schema setup is required. See `server/models/` for the full schema definitions (User, Product, Category, Order, Review, Subscriber).

## Security notes

- Passwords are hashed with bcrypt (12 salt rounds) and never returned in API responses
- JWTs are signed with a server-side secret and expire after 7 days by default
- `helmet`, CORS restricted to the configured client origin, and rate limiting on auth routes
- All inputs are validated server-side with `express-validator`
- Admin-only endpoints check both authentication and role

## Future improvements

- Real payment gateway integration (e.g. Stripe) in place of the demo payment flow
- Email delivery for order confirmations and password resets
- Product image upload (currently image URLs) via a service like Cloudinary/S3
- Coupon codes and multi-address support
- Automated tests (Jest/Supertest for the API, React Testing Library for the client)
- Dockerised local setup

## Why I built this project

I built ShopSphere to practice and demonstrate the core skills expected of a full-stack developer: designing a relational-feeling schema in MongoDB, building a secure REST API with proper authentication and authorization, and building a responsive, production-style UI on top of it in React. It covers the pieces I wanted in my portfolio — real CRUD operations, JWT auth, role-based access control, search/filtering, a shopping cart and checkout flow, and an admin dashboard with real data — rather than a static mockup. Every button, form, and API call in this project actually works end-to-end against a real database.

---

This is a demo/portfolio project. Payments are simulated and no real transactions are processed.
