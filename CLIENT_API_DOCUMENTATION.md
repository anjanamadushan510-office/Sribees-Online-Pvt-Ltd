# 🚀 SRIBEESonline Client API Reference & Integration Guide


---

> **Architect's Note:**  
> This specification document is crafted as a turnkey integration blueprint for frontend developers building client web and mobile applications for the **SRIBEESonline Hyperlocal E-Commerce Platform**. Every client-facing endpoint is documented with exact HTTP methods, headers, query parameters, payloads, and standardized response envelopes.

---

## 📑 Table of Contents
1. [Core Architecture & Global Conventions](#1-core-architecture--global-conventions)
2. [Authentication & Profile Management](#2-authentication--profile-management)
3. [Hyperlocal Location & Branch Routing](#3-hyperlocal-location--branch-routing)
4. [Categories Catalog](#4-categories-catalog)
5. [Products, Search & Customer Reviews](#5-products-search--customer-reviews)
6. [Storefront Banners & Engagement Analytics](#6-storefront-banners--engagement-analytics)
7. [Cart Management](#7-cart-management)2
8. [Delivery Slots & Dispatch Scheduling](#8-delivery-slots--dispatch-scheduling)
9. [Checkout & Order Lifecycle](#9-checkout--order-lifecycle)
10. [Payment Methods](#10-payment-methods)
11. [Wishlist & Price-Drop Alerts](#11-wishlist--price-drop-alerts)
12. [Coupons & Promotional Discounts](#12-coupons--promotional-discounts)
13. [Wallet & Cashback Rewards](#13-wallet--cashback-rewards)
14. [Push Notifications & Device Sync](#14-push-notifications--device-sync)
15. [AI Shopping Assistant (Gemini LLM)](#15-ai-shopping-assistant-gemini-llm)
16. [Customer Support & Dispute Tickets](#16-customer-support--dispute-tickets)
17. [Referrals & Growth Engine](#17-referrals--growth-engine)
18. [App Configuration, Sync & Content](#18-app-configuration-sync--content)
19. [Frontend Engineering Best Practices & Guidelines](#19-frontend-engineering-best-practices--guidelines)

---

## 1. Core Architecture & Global Conventions

### 1.1 Base URLs

| Environment | Base URL | Usage |
|---|---|---|
| **Development (Local)** | `http://localhost:8000/api/v1` | Local backend testing |
| **Android Emulator** | `http://10.0.2.2:8000/api/v1` | Local Android dev |
| **Staging** | `https://api-staging.sribeesonline.lk/api/v1` | QA / Preview deployments |
| **Production** | `https://api.sribees.com/api/v1` | Live production cluster |

---

### 1.2 Global Request Headers

| Header | Format / Example | Required | Purpose |
|---|---|---|---|
| `Content-Type` | `application/json` | ✅ Yes | Payload serialization |
| `Accept` | `application/json` | ✅ Yes | Response format negotiation |
| `Authorization` | `Bearer <access_token>` | Authenticated only | JWT bearer authentication |
| `X-Device-Id` | `UUIDv4` (e.g. `c9bf9e57-1685-4c89-bafb-ff5af830be8a`) | **Guests** | Essential for Guest session, Branch context & Cart tracking |
| `Accept-Language` | `en` \| `si` \| `ta` | Optional (default: `en`) | Multi-lingual localization for titles, categories, descriptions |
| `X-Client-Platform` | `web` \| `android` \| `ios` | Optional | Platform tracking & asset resolution |

---

### 1.3 Standard Response & Error Envelopes

#### ✅ Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable feedback"
}
```

#### ❌ Standard Error Envelope (RFC 7807 Compliant)
```json
{
  "success": false,
  "detail": "Invalid credentials provided.",
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "errors": {
    "email": ["Must be a valid email address"]
  }
}
```

---

## 2. Authentication & Profile Management

### 2.1 User Login
* **Method & Endpoint:** `POST /auth/login`
* **Auth Required:** No (Public)
* **Headers:** `Content-Type: application/json`

#### Request Payload:
```json
{
  "email": "customer@sribees.com",
  "password": "SecurePassword123!",
  "remember_me": true
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "user": {
    "user_id": "4b6f1220-7f28-4e89-a9a2-9843a851893c",
    "email": "customer@sribees.com",
    "full_name": "Kasun Perera",
    "phone": "+94771234567",
    "profile_picture_url": "https://media.sribees.com/avatars/user-123.webp",
    "is_verified": true,
    "created_at": "2026-01-15T08:30:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### Error Responses:
* `401 Unauthorized`: `{"detail": "Incorrect email or password"}`
* `403 Forbidden`: `{"detail": "Account is suspended"}`

---

### 2.2 Customer Registration
* **Method & Endpoint:** `POST /auth/register`
* **Auth Required:** No (Public)

#### Request Payload:
```json
{
  "email": "kasun@example.lk",
  "password": "StrongPassword@2026",
  "full_name": "Kasun Perera",
  "phone": "+94771234567"
}
```

#### Response `201 Created`:
```json
{
  "success": true,
  "user": {
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "kasun@example.lk",
    "full_name": "Kasun Perera",
    "phone": "+94771234567",
    "is_verified": false
  },
  "tokens": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi..."
  }
}
```

---

### 2.3 Refresh Access Token
* **Method & Endpoint:** `POST /auth/refresh`
* **Auth Required:** No (Uses body token)

#### Request Payload:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response `200 OK`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### 2.4 Get Current Profile (`/auth/me`)
* **Method & Endpoint:** `GET /auth/me`
* **Auth Required:** Bearer Token

#### Response `200 OK`:
```json
{
  "success": true,
  "user": {
    "user_id": "4b6f1220-7f28-4e89-a9a2-9843a851893c",
    "email": "customer@sribees.com",
    "full_name": "Kasun Perera",
    "phone": "+94771234567",
    "profile_picture_url": "https://media.sribees.com/avatars/user-123.webp",
    "is_verified": true,
    "loyalty_tier": "GOLD",
    "loyalty_points": 1420
  }
}
```

---

### 2.5 Update User Profile
* **Method & Endpoint:** `PATCH /auth/me`
* **Auth Required:** Bearer Token

#### Request Payload:
```json
{
  "first_name": "Kasun",
  "last_name": "Perera",
  "phone": "+94779876543",
  "profile_picture_url": "https://media.sribees.com/avatars/new.webp"
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "user": {
    "user_id": "4b6f1220-7f28-4e89-a9a2-9843a851893c",
    "full_name": "Kasun Perera",
    "phone": "+94779876543",
    "profile_picture_url": "https://media.sribees.com/avatars/new.webp"
  }
}
```

---

### 2.6 Password Management & Logout
* `POST /auth/change-password`: `{"current_password": "old", "new_password": "new"}` (Bearer Auth)
* `POST /auth/forgot-password`: `{"email": "user@example.com"}` (Public)
* `POST /auth/logout`: Body empty (Bearer Auth)

---

## 3. Hyperlocal Location & Branch Routing

SRIBEESonline operates as a multi-branch hyperlocal delivery engine. All product listings, pricing, and stock levels are filtered by the serving branch.

### 3.1 Cascading Location Discovery

#### A. Get All Provinces
* `GET /locations/provinces`
```json
{
  "success": true,
  "data": [
    { "province": "Western Province", "district_count": 3, "post_office_count": 142, "branch_count": 4 },
    { "province": "Southern Province", "district_count": 3, "post_office_count": 98, "branch_count": 2 }
  ]
}
```

#### B. Get Districts by Province
* `GET /locations/districts?province=Western%20Province`
```json
{
  "success": true,
  "data": [
    { "district": "Kalutara", "province": "Western Province", "post_office_count": 42 },
    { "district": "Colombo", "province": "Western Province", "post_office_count": 64 }
  ]
}
```

#### C. Get Post Offices by District
* `GET /locations/post-offices?district=Kalutara`
```json
{
  "success": true,
  "data": [
    { "post_office": "Welipenna", "district": "Kalutara", "province": "Western Province", "postal_code": "12000" },
    { "post_office": "Aluthgama", "district": "Kalutara", "province": "Western Province", "postal_code": "12050" }
  ]
}
```

---

### 3.2 Resolve Serving Branch

#### By Selected Delivery Post Office (Guests & Manual Select)
* **Method & Endpoint:** `POST /branch/resolve-by-location`
* **Headers:** `X-Device-Id: <UUID>` (or Bearer token)

#### Request Payload:
```json
{
  "province": "Western Province",
  "district": "Kalutara",
  "post_office": "Welipenna"
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "branch_id": "7c12f458-7e10-48e0-bb12-4c22a7f83011",
    "branch_name": "Kalutara Main Fulfillment Hub",
    "province": "Western Province",
    "district": "Kalutara",
    "post_office": "Welipenna",
    "delivery_supported": true,
    "flat_delivery_fee": 350.00
  }
}
```

---

### 3.3 Saved Customer Addresses (`/user/addresses`)

* `GET /user/addresses` — List user's saved addresses
* `POST /user/addresses` — Create address
* `PUT /user/addresses/{address_id}` — Update address
* `DELETE /user/addresses/{address_id}` — Remove address

#### Address Object Schema:
```json
{
  "address_id": "89e5dbba-2e55-46aa-9cb0-3944747514f1",
  "label": "Home",
  "recipient_name": "Kasun Perera",
  "recipient_phone": "+94771234567",
  "address_line_1": "No. 45, Temple Road",
  "address_line_2": "Welipenna Junction",
  "city": "Welipenna",
  "district": "Kalutara",
  "province": "Western Province",
  "post_office": "Welipenna",
  "is_default": true
}
```

---

## 4. Categories Catalog

### 4.1 List Categories
* **Method & Endpoint:** `GET /categories`
* **Query Parameters:**
  * `hierarchical` (`boolean`, default: `false`) — Nested tree structure
  * `top_level_only` (`boolean`, default: `false`) — Only root categories (ideal for home carousels)
* **Headers:** `Accept-Language: si` (optional localization), `X-Device-Id` / Bearer token

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category_id": "d1e7c530-9759-4d64-8b63-8a9d1cb22920",
        "_id": "d1e7c530-9759-4d64-8b63-8a9d1cb22920",
        "name": "Rice & Grains",
        "slug": "rice-grains",
        "description": "Premium staples, local and basmati rice varieties",
        "image_url": "https://media.sribees.com/categories/rice.webp",
        "parent_category_id": null,
        "is_active": true,
        "product_count": 38
      }
    ]
  }
}
```

---

## 5. Products, Search & Customer Reviews

### 5.1 Product Search & Catalog Discovery
* **Method & Endpoint:** `GET /products/search`
* **Headers:** `X-Device-Id` or `Authorization: Bearer <token>` (Required for branch inventory filtering)
* **Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | string | `null` | Full-text keyword search |
| `category_id` | UUID | `null` | Category filter |
| `page` | integer | `1` | Page number |
| `page_size` | integer | `20` | Items per page (max: 50) |
| `sort_by` | string | `relevance` | `relevance` \| `price_asc` \| `price_desc` \| `newest` \| `popular` |
| `min_price` | float | `null` | Price lower bound |
| `max_price` | float | `null` | Price upper bound |
| `in_stock` | boolean | `null` | Filter available items only |
| `is_featured` | boolean | `null` | Featured products |
| `on_sale` | boolean | `null` | Discounted products |

#### Response `200 OK`:
```json
{
  "success": true,
  "products": [
    {
      "product_id": "3ecb001a-8267-46ef-b92a-36427b3fa990",
      "name": "Keeri Samba Rice 5kg",
      "description": "High quality polished Sri Lankan Keeri Samba",
      "sku": "RIC-KS-5KG",
      "price": 1450.00,
      "sale_price": 1320.00,
      "stock_quantity": 45,
      "category_id": "d1e7c530-9759-4d64-8b63-8a9d1cb22920",
      "category": { "name": "Rice & Grains" },
      "brand": "SRIBEES Select",
      "images": [
        {
          "image_id": "img-001",
          "image_url": "https://media.sribees.com/products/keeri-5kg.webp",
          "thumbnail_url": "https://media.sribees.com/products/keeri-5kg-thumb.webp",
          "is_primary": true
        }
      ],
      "variants": [],
      "average_rating": 4.8,
      "review_count": 24,
      "is_featured": true,
      "is_active": true
    }
  ],
  "total": 128,
  "facets": {
    "brands": [{ "name": "SRIBEES Select", "count": 14 }],
    "price_range": { "min": 250.00, "max": 8500.00 }
  }
}
```

---

### 5.2 Product Detail
* **Method & Endpoint:** `GET /products/{product_id}`
* **Response `200 OK`:** Full `Product` object.

---

### 5.3 Autocomplete & Search Suggestions
* **Method & Endpoint:** `GET /products/autocomplete?query=bas&limit=5`
```json
[
  { "type": "product", "text": "Basmati Rice 5kg", "id": "3ecb001a..." },
  { "type": "category", "text": "Basmati & Fragrant Rice", "id": "cat-889..." }
]
```

---

### 5.4 Customer Reviews

#### A. List Reviews
* `GET /products/{product_id}/reviews?page=1&page_size=10`
```json
{
  "success": true,
  "reviews": [
    {
      "review_id": "rev-101",
      "product_id": "3ecb001a...",
      "user_name": "Kasun P.",
      "rating": 5,
      "title": "Superb Quality",
      "comment": "Packed neatly and delivered within 2 hours.",
      "is_verified_purchase": true,
      "created_at": "2026-03-10T14:20:00Z"
    }
  ],
  "total": 24,
  "average_rating": 4.8,
  "rating_distribution": { "5": 20, "4": 3, "3": 1, "2": 0, "1": 0 }
}
```

#### B. Submit Review
* `POST /products/{product_id}/reviews` (Bearer Auth)
* Payload: `{"rating": 5, "title": "Great", "comment": "Fresh stock!"}`

---

## 6. Storefront Banners & Engagement Analytics

### 6.1 Get Active Home Banners
* **Method & Endpoint:** `GET /banners?limit=10`
* **Headers:** `X-Device-Id` or Bearer Token (Resolves Branch Context)

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "bannerId": "b1e9c851-57cb-4b72-a16b-1662dfbb1011",
        "title": "Weekend Fresh Deals",
        "subtitle": "Get up to 25% off on vegetables & fruits",
        "imageUrl": "https://media.sribees.com/banners/weekend-sale.webp",
        "linkType": "category",
        "targetId": "d1e7c530-9759-4d64-8b63-8a9d1cb22920"
      }
    ],
    "branch": {
      "branchId": "7c12f458-7e10-48e0-bb12-4c22a7f83011",
      "branchName": "Kalutara Main Fulfillment Hub"
    },
    "total": 1
  }
}
```

---

### 6.2 Track Banner Impressions & Clicks (Batch Analytics)
* **Method & Endpoint:** `POST /banners/events`
* **Status Code:** `202 Accepted`

#### Request Payload:
```json
{
  "sessionKey": "client-launch-session-token-abc123",
  "events": [
    { "bannerId": "b1e9c851-57cb-4b72-a16b-1662dfbb1011", "eventType": "impression" },
    { "bannerId": "b1e9c851-57cb-4b72-a16b-1662dfbb1011", "eventType": "click" }
  ]
}
```

---

## 7. Cart Management

The cart engine maintains persistent server carts for both authenticated users (via Bearer token) and guest visitors (via `X-Device-Id`).

### 7.1 Get Active Cart
* **Method & Endpoint:** `GET /cart`

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product_id": "3ecb001a-8267-46ef-b92a-36427b3fa990",
        "variant_id": null,
        "name": "Keeri Samba Rice 5kg",
        "quantity": 2,
        "unit_price": 1320.00,
        "total_price": 2640.00,
        "image_url": "https://media.sribees.com/products/keeri-5kg-thumb.webp"
      }
    ],
    "totals": {
      "subtotal": 2640.00,
      "discount": 264.00,
      "delivery_fee": 350.00,
      "tax": 0.00,
      "total": 2726.00
    },
    "coupon": {
      "code": "WELCOME10",
      "discount_type": "percentage",
      "discount_value": 10.0
    },
    "updated_at": "2026-07-05T09:05:00Z"
  }
}
```

---

### 7.2 Cart Operations
| Operation | Method & Endpoint | Payload |
|---|---|---|
| **Add Item** | `POST /cart/items` | `{"product_id": "uuid", "variant_id": null, "quantity": 1}` |
| **Update Quantity** | `PATCH /cart/items/{item_key}` | `{"quantity": 3}` *(Quantity `0` removes item)* |
| **Delete Item** | `DELETE /cart/items/{item_key}` | *None* |
| **Apply Coupon** | `POST /cart/coupon` | `{"code": "WELCOME10"}` |
| **Remove Coupon** | `DELETE /cart/coupon` | *None* |
| **Clear Cart** | `DELETE /cart` | *None* |

---

## 8. Delivery Slots & Dispatch Scheduling

### 8.1 Get Available Delivery Slots
* **Method & Endpoint:** `GET /delivery/slots`
* **Headers:** `X-Device-Id` or Bearer Token

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "branch_id": "7c12f458-7e10-48e0-bb12-4c22a7f83011",
    "delivery_runs": [
      {
        "slot_id": "slot-morning-2026-10-03",
        "title": "Morning Round (09:00 AM - 12:00 PM)",
        "cutoff_time": "2026-10-03T08:00:00Z",
        "is_available": true
      },
      {
        "slot_id": "slot-evening-2026-10-03",
        "title": "Evening Round (04:00 PM - 07:00 PM)",
        "cutoff_time": "2026-10-03T15:00:00Z",
        "is_available": true
      }
    ]
  }
}
```

---

## 9. Checkout & Order Lifecycle

### 9.1 Place Order (Checkout)
* **Method & Endpoint:** `POST /orders`
* **Auth Required:** Bearer Token

#### Request Payload:
```json
{
  "branch_id": "7c12f458-7e10-48e0-bb12-4c22a7f83011",
  "address_id": "89e5dbba-2e55-46aa-9cb0-3944747514f1",
  "delivery_slot_id": "slot-morning-2026-10-03",
  "payment_method": "cod",
  "use_wallet": true,
  "coupon_code": "WELCOME10",
  "notes": "Please leave at front door security."
}
```

#### Response `201 Created`:
```json
{
  "success": true,
  "data": {
    "order_id": "5f9b4c22-0a11-4cb7-8e3f-6799d14f2e08",
    "order_number": "SRB-2026-10824",
    "status": "placed",
    "payment_status": "pending",
    "totals": {
      "subtotal": 2640.00,
      "coupon_discount": 264.00,
      "delivery_fee": 350.00,
      "wallet_deduction": 500.00,
      "total_payable": 2226.00
    },
    "cashback_earned": 264.00,
    "created_at": "2026-10-02T14:30:00Z"
  },
  "message": "Order placed successfully!"
}
```

---

### 9.2 List Customer Orders
* **Method & Endpoint:** `GET /orders?page=1&page_size=20&status=active`
* **Query Options:** `status`: `all` \| `active` \| `delivered` \| `cancelled`

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "order_id": "5f9b4c22-0a11-4cb7-8e3f-6799d14f2e08",
        "order_number": "SRB-2026-10824",
        "status": "out_for_delivery",
        "item_count": 3,
        "total_amount": 2226.00,
        "created_at": "2026-10-02T14:30:00Z"
      }
    ],
    "total": 14
  }
}
```

---

### 9.3 Reorder Items from Past Order
* **Method & Endpoint:** `POST /orders/{order_id}/reorder`
* **Response `200 OK`:** Populates active cart with available items and returns skipped items if out of stock.

---

## 10. Payment Methods

### 10.1 List Active Payment Methods
* **Method & Endpoint:** `GET /payment-methods`
* **Auth Required:** Bearer Token

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "cod",
        "code": "COD",
        "name": "Cash on Delivery",
        "type": "OFFLINE",
        "is_active": true
      },
      {
        "id": "wallet",
        "code": "WALLET",
        "name": "SRIBEES Wallet Balance",
        "type": "WALLET",
        "is_active": true
      }
    ]
  }
}
```

---

## 11. Wishlist & Price-Drop Alerts

* `GET /wishlist` — List all items in customer wishlist
* `POST /wishlist/toggle/{product_id}` — **Optimistic Toggle:** Adds if absent, removes if present.
* `GET /wishlist/price-drops` — Returns items whose current price dropped below `price_at_watch`.

#### Toggle Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "in_wishlist": true
  },
  "message": "Product added to wishlist"
}
```

---

## 12. Coupons & Promotional Discounts

### 12.1 List Available Public Coupons
* **Method & Endpoint:** `GET /coupons`
* **Auth:** Guest or Authenticated

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "code": "SRIBEES500",
        "description": "Rs. 500 off on orders above Rs. 4,000",
        "discount_type": "fixed",
        "discount_value": 500.0,
        "min_order_value": 4000.0,
        "valid_until": "2026-12-31T23:59:59Z"
      }
    ]
  }
}
```

---

## 13. Wallet & Cashback Rewards

### 13.1 Get Wallet Balance
* **Method & Endpoint:** `GET /wallet`
* **Auth Required:** Bearer Token

```json
{
  "success": true,
  "data": {
    "balance": 850.00,
    "currency": "LKR",
    "cashback_rate": 0.10
  }
}
```

---

### 13.2 Wallet Transactions
* **Method & Endpoint:** `GET /wallet/transactions?page=1&page_size=20`

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "tx-8819",
        "type": "earned",
        "title": "Order Cashback",
        "order_id": "SRB-2026-10824",
        "amount": 264.00,
        "created_at": "2026-10-02T15:00:00Z"
      },
      {
        "transaction_id": "tx-8810",
        "type": "spent",
        "title": "Applied at Checkout",
        "order_id": "SRB-2026-10824",
        "amount": 500.00,
        "created_at": "2026-10-02T14:30:00Z"
      }
    ],
    "total": 18
  }
}
```

---

## 14. Push Notifications & Device Sync

### 14.1 Register FCM Device Push Token
* **Method & Endpoint:** `POST /notifications/push/token`
* **Auth Required:** Bearer Token

#### Request Payload:
```json
{
  "token": "fcm_token_string_from_firebase_sdk...",
  "platform": "web",
  "device_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a"
}
```

---

### 14.2 List Notifications & Mark Read
* `GET /notifications` — List paginated notifications
* `PATCH /notifications/{notification_id}/read` — Mark single notification read
* `PUT /notifications/read-all` — Mark all as read

---

## 15. AI Shopping Assistant (Gemini LLM)

Grounds real-time catalog search, multi-turn chat, and recipe / grocery recommendations based strictly on branch inventory.

### 15.1 Send Message to Shopping Assistant
* **Method & Endpoint:** `POST /chat`
* **Headers:** `X-Device-Id` or Bearer Token

#### Request Payload:
```json
{
  "message": "I want to cook chicken curry for 4 people tonight. What ingredients do you have in stock?",
  "conversation_id": "conv-uuid-or-null"
}
```

#### Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "conversation_id": "4b6f1220-7f28-4e89-a9a2-9843a851893c",
    "reply": "Here are the fresh ingredients available right now in your Kalutara hub:",
    "recommended_products": [
      {
        "product_id": "3ecb001a...",
        "name": "Fresh Whole Chicken 1kg",
        "price": 1150.00,
        "in_stock": true
      },
      {
        "product_id": "8f12a10c...",
        "name": "Roasted Curry Powder 100g",
        "price": 180.00,
        "in_stock": true
      }
    ]
  }
}
```

---

## 16. Customer Support & Dispute Tickets

* `GET /support/tickets` — List customer support tickets
* `POST /support/tickets` — Create new ticket:
```json
{
  "subject": "Delay in delivery",
  "category": "order_issue",
  "order_id": "5f9b4c22-0a11-4cb7-8e3f-6799d14f2e08",
  "message": "The rider has not arrived yet."
}
```
* `POST /support/tickets/{ticket_id}/messages` — Reply to ticket thread

---

## 17. Referrals & Growth Engine

* `GET /referrals` — Returns customer's invite code and total referral commissions earned.

```json
{
  "success": true,
  "data": {
    "referral_code": "KASUN2026",
    "referral_link": "https://sribees.com/r/KASUN2026",
    "total_invited": 12,
    "total_earned": 3000.00
  }
}
```

---

## 18. App Configuration, Sync & Content

* `GET /app/splash-config` — Remote splash video config & app feature flags
* `GET /app/sync-state` — Timestamp hash of category/catalog updates to allow client-side caching
* `GET /app/content/{page}` (`privacy-policy`, `terms-of-service`, `about-us`) — Content managed via CMS

---

## 19. Frontend Engineering Best Practices & Guidelines

1. **Persistent `X-Device-Id` Lifecycle:**
   - On the web client's initial initialization, generate a UUIDv4 if not present in `localStorage`:
   ```javascript
   const deviceId = localStorage.getItem('sribees_device_id') || crypto.randomUUID();
   localStorage.setItem('sribees_device_id', deviceId);
   ```
   - Pass this header in **every single request** (Axios/Fetch interceptor).

2. **Silent JWT Token Refresh Interceptor:**
   - Intercept HTTP `401 Unauthorized`.
   - Hold subsequent outgoing requests in a queue while executing `POST /auth/refresh` with the stored `refresh_token`.
   - If refreshed successfully, update storage and replay queued requests with the new `access_token`.
   - If refresh fails, clear auth tokens and route the user to `/login`.

3. **Optimistic UI Updates:**
   - **Wishlist Toggle:** Immediately invert the heart icon state in the UI before network completion; revert only on HTTP error.
   - **Cart Counter:** Increment badge count immediately when user clicks "Add to Cart".

4. **Multi-Lingual Localization:**
   - Set the `Accept-Language: si` or `Accept-Language: ta` header according to the client language switcher to automatically receive backend localized names and descriptions.
