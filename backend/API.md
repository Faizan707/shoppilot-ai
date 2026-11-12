# ShopPilot AI — API Documentation

Base URL: `http://localhost:5001/api`  
Auth: JWT stored in HTTP-only cookie `token` (`credentials: include` / Axios `withCredentials: true`)

## Response format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": { "page": 1, "limit": 12, "total": 100, "totalPages": 9 }
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Service health check |

---

## Auth `/auth`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/register` | No | `{ name, email, password, phone? }` | Register customer |
| POST | `/login` | No | `{ email, password }` | Login |
| POST | `/logout` | No | — | Clear auth cookie |
| GET | `/me` | Yes | — | Current user |
| PUT | `/profile` | Yes | `{ name?, phone?, address? }` | Update profile |
| PUT | `/password` | Yes | `{ currentPassword, newPassword }` | Change password |

Auth endpoints are rate-limited (30 req / 15 min).

---

## Users `/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | Yes | Alias of current user |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/password` | Yes | Change password |

---

## Products `/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | List products (filters below) |
| GET | `/:id` | No | Get by id or slug |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |
| GET | `/:id/reviews` | No | List reviews |
| POST | `/:id/reviews` | Yes | Add review `{ rating, comment }` |

Query params for `GET /products`:

- `page`, `limit`
- `search`
- `category` (ObjectId)
- `minPrice`, `maxPrice`
- `sort`: `newest` \| `price_asc` \| `price_desc` \| `popular` \| `rating`
- `featured=true`
- `all=true` (admin only — include inactive)

---

## Categories `/categories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | List active (or all with `?all=true` as admin) |
| GET | `/:id` | No | Get category |
| POST | `/` | Admin | Create `{ name, description?, image? }` |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

---

## Cart `/cart`

All routes require authentication.

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/` | — | Get cart + subtotal |
| POST | `/` | `{ productId, quantity? }` | Add item |
| PUT | `/:productId` | `{ quantity }` | Update quantity |
| DELETE | `/:productId` | — | Remove item |
| DELETE | `/` | — | Clear cart |

---

## Wishlist `/wishlist`

All routes require authentication.

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/` | — | Get wishlist |
| POST | `/` | `{ productId }` | Add product |
| DELETE | `/:productId` | — | Remove product |

---

## Orders `/orders`

All routes require authentication.

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/` | `{ shippingAddress }` | Place COD order from cart |
| GET | `/` | — | My orders (paginated) |
| GET | `/:id` | — | My order details |
| PUT | `/:id/cancel` | — | Cancel if Pending/Confirmed |

`shippingAddress`: `{ fullName, phone, street, city, state, postalCode, country }`

Statuses: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

---

## Admin `/admin`

All routes require admin role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Stats, recent orders, 7-day sales overview |
| GET | `/customers` | List customers (`page`, `limit`, `search`) |
| PUT | `/customers/:id` | `{ isActive }` |
| GET | `/products/:id` | Product including inactive |
| GET | `/orders` | All orders (`status`, `search`, pagination) |
| GET | `/orders/:id` | Order detail |
| PUT | `/orders/:id/status` | `{ status, note? }` |

---

## Internal service auth (future AI)

Header: `x-internal-service-secret: <INTERNAL_SERVICE_SECRET>`

Middleware: `internalServiceAuth` in `src/middleware/auth.ts`  
Use this when the FastAPI AI service needs to call Node APIs securely.
