# ShopPilot AI

Production-style MERN e-commerce platform built with **TypeScript** on both frontend and backend. Prepared for a future FastAPI + LangChain + Qdrant AI support service (not included in this version).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TypeScript, React Router, Bootstrap 5, Axios, Context API, Lucide, React Toastify |
| Backend | Node.js, Express 5, TypeScript, MongoDB, Mongoose, JWT (HTTP-only cookies), bcrypt, Helmet, CORS, rate limiting |
| Auth | Customer + Admin roles |

## Project structure

```text
ShopPilot-AI/
├── frontend/          # Vite + React + TypeScript storefront & admin UI
├── backend/           # Express + TypeScript REST API
└── README.md
```

## Prerequisites

- Node.js 20+
- MongoDB Atlas (or local MongoDB)
- Windows note: port **5000** is often reserved by the system — this project defaults to **5001**
- Frontend data fetching uses **TanStack Query** (`@tanstack/react-query`)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET if needed
npm install
npm run seed
npm run dev
```

API: `http://localhost:5001`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shoppilot.ai` | `Admin123!` |
| Customer | `customer@shoppilot.ai` | `Customer123!` |

Seed also creates 5 categories and 23 sample products.

```bash
cd backend
npm run seed
```

## Environment variables

### Backend (`backend/.env`)

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/shoppilot-ai
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
COOKIE_SECURE=false
INTERNAL_SERVICE_SECRET=change_this_internal_service_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

Never commit real secrets. Use `.env.example` as the template.

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run seed` | Reset DB and insert sample data |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- JWT auth in HTTP-only cookies, bcrypt passwords, role-based access
- Product catalog with search, category/price filters, sorting, pagination, reviews
- Persistent cart & wishlist for authenticated users
- Checkout with Cash on Delivery
- Order history, details, status tracking, customer cancel (Pending/Confirmed)
- Admin dashboard: revenue, orders, customers, products, sales chart
- Admin CRUD for products, categories, orders, customers

## API overview

Base path: `/api`

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password` |
| Users | `GET/PUT /users/profile`, `PUT /users/password` |
| Products | `GET /products`, `GET /products/:id`, admin `POST/PUT/DELETE`, reviews `GET/POST /products/:id/reviews` |
| Categories | `GET /categories`, admin `POST/PUT/DELETE` |
| Cart | `GET/POST /cart`, `PUT/DELETE /cart/:productId`, `DELETE /cart` |
| Wishlist | `GET/POST /wishlist`, `DELETE /wishlist/:productId` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/cancel` |
| Admin | `GET /admin/dashboard`, customers, orders, product lookup |
| Health | `GET /api/health` |

Consistent response shape:

```json
{ "success": true, "message": "...", "data": {}, "meta": { "page": 1, "limit": 12, "total": 23, "totalPages": 2 } }
```

## Architecture notes

- Controllers handle HTTP; **services** hold business logic (reusable for a future internal AI service)
- Mongoose models: User, Product, Category, Cart, Wishlist, Order, Review
- Orders store **price snapshots** so historical totals stay correct after catalog price changes
- `INTERNAL_SERVICE_SECRET` + `internalServiceAuth` middleware prepare authenticated Node ↔ FastAPI calls
- No AI/chatbot/LLM code in this version

## Order statuses

`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` (or `Cancelled`)

## Security

- Password hashing (bcrypt)
- HTTP-only JWT cookies
- Helmet, CORS (credentials + `CLIENT_URL`)
- Auth rate limiting
- Admin route guards
- Users can only access their own orders

## Future AI integration

A separate Python FastAPI service (LangChain + Qdrant) can call this API using:

- `INTERNAL_SERVICE_SECRET` header (`x-internal-service-secret`)
- Modular product/order services under `backend/src/services/`

Do not add AI features in the MERN app itself.
