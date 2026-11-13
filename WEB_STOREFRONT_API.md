# Sribees Online — Web Storefront API Reference

| | |
|---|---|
| **Audience** | Frontend developers building the customer-facing web store |
| **API version** | `v1` |
| **Last updated** | 2026-10-07 |
| **Source of truth** | Written from the backend source code (`fastapi_backend/app`), not from older docs |
| **Matches** | The **development** server (branch `development`), which is what you build against. Production is one release behind it; the differences are marked *Not in production yet*. |
| **Verification** | Paths, parameters and field names are taken from the code and its generated OpenAPI schema. Nothing here was replayed against a live server. Example values are illustrative; the shapes are real. |

This is the same API the Sribees Online mobile app uses. There is no separate "web API". Everything a customer can do in the app, the web store can do with the endpoints below — with a handful of web-specific gaps listed in [section 17](#17-web-specific-gaps-and-open-questions). Read that section before you estimate the work.

---

## Contents

1. [Read this first](#1-read-this-first)
2. [Environments and quick start](#2-environments-and-quick-start)
3. [Core concepts](#3-core-concepts)
4. [Conventions](#4-conventions)
5. [Authentication and profile](#5-authentication-and-profile)
6. [Delivery location and branch context](#6-delivery-location-and-branch-context)
7. [Catalog](#7-catalog)
8. [Addresses](#8-addresses)
9. [Cart](#9-cart)
10. [Coupons](#10-coupons)
11. [Checkout and payments](#11-checkout-and-payments)
12. [Orders](#12-orders)
13. [Wallet, loyalty and referrals](#13-wallet-loyalty-and-referrals)
14. [Wishlist and reviews](#14-wishlist-and-reviews)
15. [Notifications, support, app config, chat](#15-notifications-support-app-config-chat)
16. [Endpoint index](#16-endpoint-index)
17. [Web-specific gaps and open questions](#17-web-specific-gaps-and-open-questions)
18. [Endpoints you must not use](#18-endpoints-you-must-not-use)
19. [Appendix: TypeScript client skeleton](#19-appendix-typescript-client-skeleton)

---

## 1. Read this first

Seven things that will cost you a day each if you find them by accident.

1. **The catalog is per branch.** There is no global product list. Until the shopper picks a delivery location, every product, banner and home-feed call answers `400 NO_BRANCH_CONTEXT`. Location first, catalog second. See [section 6](#6-delivery-location-and-branch-context).
2. **Guests are identified by a header you generate.** Send `X-Device-Id` (a random UUID you keep in `localStorage`) on every request. Without it, guest catalog calls answer `400 DEVICE_ID_REQUIRED`.
3. **Field casing is mixed.** Auth, branch, location, banner and referral payloads are `camelCase`. Catalog, cart, order, address, wallet and coupon payloads are `snake_case`. Do not run a global case converter — copy field names from this document.
4. **Errors come in four shapes.** Use the normalizer in [section 4.4](#44-errors). Do not assume `response.error.message` exists.
5. **The server decides, the client draws.** Prices, delivery fees, coupon eligibility, cancel rules, payment state and most customer-facing wording come back ready to render, already in the shopper's language. Do not re-implement these rules in the browser; they change without notice.
6. **Prices you send are ignored.** `POST /cart/items` takes a `price`, but the server replaces it with the catalogue price. Always render the cart and totals the server returns.
7. **Card payment has no web return path yet.** The gateway sends the browser back to a URL configured for the mobile app. This needs a backend change before web card payments work end to end. Cash on Delivery and wallet payments are unaffected. See [section 11.5](#115-paying-online-on-the-web).

---

## 2. Environments and quick start

### 2.1 Base URLs

| Environment | Base URL | Notes |
|---|---|---|
| Production | `https://api.sribees.com/api/v1` | Real customers, real SMS, real payments |
| Development | `https://devapionline.sribees.com/api/v1` | Use this for all development work |

All paths in this document are relative to the base URL. `GET /products` means `GET https://…/api/v1/products`.

Two routes live outside `/api/v1`:

- `GET /health` — liveness check, returns `{ "success": true, "environment": "…", "version": "1.0.0" }`.
- `GET /api` — a small index of route groups.

The development server also serves interactive Swagger and the machine-readable schema — use them to try calls and to generate types:

- `https://devapionline.sribees.com/docs`
- `https://devapionline.sribees.com/openapi.json`

Both are switched off in production. Treat the schema as a companion to this document, not a replacement: most responses are typed there as a bare `object`, and it lists admin and legacy routes next to the storefront ones.

### 2.2 First working requests

No account is needed for this sequence. Replace the place names with values the previous call returned — which provinces are live differs per environment.

```bash
BASE=https://devapionline.sribees.com/api/v1
DEVICE=$(uuidgen)   # generate once, then reuse

# 1. Where do we deliver?
curl "$BASE/locations/provinces"
curl "$BASE/locations/districts?province=Western"
curl "$BASE/locations/postal-cities?district=Colombo"

# 2. Tell the server where this guest is. This sets the branch context.
curl -X POST "$BASE/branch/resolve-by-location" \
  -H "X-Device-Id: $DEVICE" -H "Content-Type: application/json" \
  -d '{"province":"Western","district":"Colombo","postal_city":"Nugegoda"}'

# 3. Now the catalog answers — in Sinhala, because we asked for it.
curl "$BASE/products?limit=5" -H "X-Device-Id: $DEVICE" -H "Accept-Language: si"
```

### 2.3 Testing sign-in without spending SMS credit

Every OTP request to a real number sends a paid SMS. The backend has a list of test phone numbers that sign in with a fixed test code and send nothing. **Ask the project owner for a test number and its code** before you build the sign-in screen. Do not loop OTP requests against real numbers.

---

## 3. Core concepts

### 3.1 Who is calling: guest or customer

| | Guest | Signed-in customer |
|---|---|---|
| Identified by | `X-Device-Id` header | `Authorization: Bearer <accessToken>` |
| Can browse the catalog | Yes | Yes |
| Can use the cart, checkout, orders, wallet, wishlist | No (`401`) | Yes |
| Branch context stored under | `guest:<device id>` | the user id |

A guest's branch context and a customer's branch context are **two separate records**. After sign-in you must set the location again for the customer (see [6.3](#63-after-sign-in)).

Many catalog endpoints accept optional authentication. If the access token is missing, expired or invalid, they silently treat the caller as a guest. A signed-in user with an expired token therefore gets the guest's catalog (or `DEVICE_ID_REQUIRED`), not a `401`. Two consequences:

- Send `X-Device-Id` on every request, signed in or not.
- Refresh the access token **before** it expires (decode the JWT `exp`), not only after a `401`.

### 3.2 Branch context

Sribees Online is hyper-local. A branch serves a set of postal cities and has its own stock, prices, discounts, cashback rates, banners and coupons. The server remembers which branch the caller is shopping from for **30 days** in a server-side session. Every catalog call reads it; you never pass a branch id in a request.

### 3.3 Server-driven presentation

Several payloads carry display-ready fields. Render them as given:

| Payload | Render these | Do not compute |
|---|---|---|
| Order | `status_label`, `payment.title`, `payment.message`, `payment.tone`, `payment.can_pay`, `payment.pay_label`, `cancel_state`, `show_delivery_code` | Status wording, whether "Pay now" or "Cancel" appears |
| Coupon card | `label`, `terms`, `section`, `action`, `status.text`, `reason`, `saving`, `dimmed` | Eligibility, discount amounts |
| Cart / quote | `totals`, `delivery.message`, `delivery.available` | Delivery fee, tax, cashback |
| OTP challenge | `codeLength`, `resendInSeconds`, `destination`, `message` | Number of input boxes, countdown length |
| Payment methods | The list as returned | Which methods exist |

### 3.4 Languages

Send `Accept-Language: en`, `si` or `ta`. Product and category names, order status labels, coupon wording, OTP and payment messages come back in that language, falling back to English per field. Forms like `si-LK` are accepted. Anything else resolves to English.

---

## 4. Conventions

### 4.1 Request headers

| Header | When | Value |
|---|---|---|
| `Content-Type` | Every request with a body | `application/json` (except the one multipart upload) |
| `Authorization` | Signed-in calls | `Bearer <accessToken>` |
| `X-Device-Id` | Every request | A stable random id per browser. 8–80 characters from `A–Z a–z 0–9 _ . : -`. A UUID is fine. |
| `Accept-Language` | Every request | `en`, `si` or `ta` |
| `X-Device-Name` | Sign-in calls, optional | A label shown in the customer's session list, e.g. `Chrome on Windows` |
| `X-Client-Platform` | Optional | Send `web`. Recorded on order cancellations for audit. |

Authentication is by bearer header only. The API sets no cookies.

### 4.2 Response envelope

Most endpoints answer:

```json
{ "success": true, "data": { }, "message": "Optional human-readable text" }
```

Endpoints that do **not** follow this — check for them explicitly:

| Endpoint | Actual shape |
|---|---|
| Auth (`/auth/*`) | `success` plus top-level `user`, `tokens`, `sessions` — no `data` wrapper |
| `GET /wallet` | Flat object: `balance`, `currency`, … — no `success`, no `data` |
| `GET /products/{id}/reviews` | Flat: `reviews`, `total`, `average_rating`, `rating_distribution` |
| `POST /products/{id}/reviews` | The review object itself |
| `POST /support/tickets` | Flat: `success`, `ticket_id`, `ticket_number`, `message` |
| `GET /support/my-tickets` | Flat: `items`, `total` |
| `GET /locations/*` | `success`, `data` (an array), and a top-level `total` |

### 4.3 Field casing

| Area | Casing |
|---|---|
| Auth responses, sessions, OTP challenge | `camelCase` |
| Branch context, locations, banners, delivery slots, referrals, support info | `camelCase` |
| Products, categories, cart, coupons, orders, addresses, wallet, wishlist, notifications, payment methods | `snake_case` |
| Request bodies | `snake_case`, with two exceptions: `addressId` (branch/session location) and banner events (`bannerId`, `eventType`, `sessionKey`) |

Some payloads carry duplicate legacy keys kept for old app builds. Ignore them and use the modern key:

| Ignore | Use |
|---|---|
| `_id` | `product_id` / `category_id` |
| `post_office`, `postOffice`, `postOfficeCount`, `postOffices` | `postal_city`, `postalCity`, `postalCityCount`, `postalCities` |
| Payment method `id`, `type`, `is_active` | `code`, `kind` |

### 4.4 Errors

The HTTP status is always meaningful. The body has one of four shapes:

```jsonc
// A — structured (auth failures, not-found from core, rate limit, OTP, unhandled 500)
{ "success": false, "error": { "message": "Authentication required", "code": "AUTH_FAILED" } }

// B — plain message (most business refusals: stock, coupons, cancel, payment)
{ "detail": "Only 3 items available in stock for this branch" }

// C — structured, nested under detail (branch context, product not found, referrals)
{ "detail": { "success": false, "error": { "message": "No branch selected…", "code": "NO_BRANCH_CONTEXT" } } }

// D — request validation, HTTP 422
{ "detail": [ { "loc": ["body", "phone"], "msg": "Value error, Enter a Sri Lankan mobile number, e.g. 0771234567", "type": "value_error" } ] }
```

Normalize once, at the edge:

```ts
export interface ApiError { status: number; code: string | null; message: string; fields?: Record<string, string>; retryAfter?: number; }

export function normalizeError(status: number, body: any): ApiError {
  const e = body?.error ?? body?.detail?.error;                      // shapes A and C
  if (e) return { status, code: e.code ?? null, message: e.message, fields: e.errors, retryAfter: e.retry_after };
  if (typeof body?.detail === "string") return { status, code: null, message: body.detail };   // shape B
  if (Array.isArray(body?.detail)) {                                  // shape D
    const fields: Record<string, string> = {};
    for (const d of body.detail) fields[String(d.loc?.at(-1))] = String(d.msg).replace(/^Value error, /, "");
    return { status, code: "VALIDATION", message: Object.values(fields)[0] ?? "Invalid input", fields };
  }
  return { status, code: null, message: "Something went wrong. Please try again." };
}
```

The `message` in shapes A, B and C is written for the customer and, where the feature supports it, already translated. It is safe to show as is.

**Error codes you should handle by code, not by message:**

| HTTP | Code | Meaning | What the UI does |
|---|---|---|---|
| 400 | `DEVICE_ID_REQUIRED` | Guest call without `X-Device-Id` | Bug in the client — add the header |
| 400 | `NO_BRANCH_CONTEXT` | No delivery location chosen, or it expired | Open the location picker |
| 400 | `OTP_INVALID` | Wrong, used or expired code | Show the message, let them retry |
| 400 | `VALIDATION_ERROR` | Business validation; may carry `errors` per field | Show field errors |
| 400 | `DUPLICATE_ERROR` | Value already used (`field` says which: `email`, `nic`) | Show on that field |
| 401 | `AUTH_FAILED` | No token on a protected call | Go to sign-in |
| 401 | `INVALID_TOKEN` | Token invalid, expired, or session revoked | Refresh once, then sign out |
| 403 | `ACCOUNT_BLOCKED` / `ACCOUNT_INACTIVE` | Account suspended | Show the message, sign out |
| 404 | `NOT_FOUND` | Resource missing | — |
| 404 | `LOCATION_NOT_SERVED` | No branch serves this postal city | "We don't deliver here yet" |
| 404 | `PRODUCT_NOT_FOUND` | Not sold at this branch (even if it exists elsewhere) | Product unavailable page |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Back off for `retry_after` seconds |
| 429 | `OTP_RESEND_TOO_SOON` / `OTP_TOO_MANY_REQUESTS` | OTP sending limit | Show countdown from `retry_after` |
| 503 | `OTP_SMS_UNAVAILABLE` | SMS cannot be sent right now | Show the message, offer Google sign-in |
| 500 | `INTERNAL_ERROR` | Unhandled server error | Generic retry message |

### 4.5 Pagination

Two styles exist.

```jsonc
// Style 1 — products, orders, notifications: ?page=1&limit=20   (limit max 100)
"pagination": { "total": 137, "page": 1, "limit": 20, "pages": 7 }

// Style 2 — wallet transactions, reviews: ?page=1&page_size=20
{ "total": 42, "page": 1, "page_size": 20 }
```

Pages are 1-indexed.

### 4.6 Dates and time

- Timestamps are ISO-8601 with a UTC offset, e.g. `2026-10-07T08:15:30.123456+00:00`.
- **Display every time in `Asia/Colombo`**, regardless of the browser's zone. A customer travelling abroad must still see Sri Lankan time on their order.
- For countdowns (OTP resend, `payment.pay_by`, `return_window_expires_at`), take "now" from the response `Date` header, not from the device clock. Device clocks are frequently wrong.
- One exception: the cart's `updated_at` is a Unix timestamp in seconds.

### 4.7 Money

All amounts are JSON numbers in Sri Lankan Rupees (`LKR`), two decimal places. Never do money arithmetic in the browser to decide what to charge — display the server's figures.

`cashback_percentage` on products is a percentage (`2.5` = 2.5%). `cashback_rate` on the wallet and quote is a fraction (`0.025` = 2.5%).

### 4.8 Images

Image fields come back as absolute URLs, ready for `<img src>`. Uploaded media is immutable — a replaced image gets a new URL — and is served with a one-year cache header, so cache aggressively.

Two exceptions:

- `GET /categories?hierarchical=true` returns `image_url` as the stored relative path (`/uploads/…`). Prefix it with the API origin, or use the flat list, which returns absolute URLs.
- An order line's `product_image` is whatever `image` the client sent when the item was added to the cart. Always send the absolute image URL in `POST /cart/items`.

### 4.9 Rate limits

| Scope | Limit |
|---|---|
| Any `/api/*` path | 100 requests per minute, **per client IP, per exact path** |
| `POST /chat/message` and `/chat/message/stream` | 12 per minute |
| OTP sending | See [5.1](#51-phone-otp-sign-in) |

Successful responses carry `X-RateLimit-Remaining` and `X-RateLimit-Reset`. A throttled request gets `429` with a `Retry-After` header.

The limit is keyed on the caller's IP address. If the web store fetches from a server (SSR, a backend-for-frontend, route handlers), **all shoppers share that server's IP and its 100/minute per path**. Call the API from the browser, or cache server-side fetches, until the backend exempts your server. This is open item 3 in [section 17](#17-web-specific-gaps-and-open-questions).

### 4.10 CORS

Browser calls are accepted from these origins:

| Origin | Development server | Production |
|---|---|---|
| `http://localhost:3000` | Yes | No |
| `http://localhost:3001` | Yes | Yes |
| Any `https://<name>.vercel.app` | Yes | Yes |
| Any `https://<name>.netlify.app` | Yes | No |
| `https://sribees.com` and any `https://*.sribees.com` | Yes | Yes |

So during development, run the store on `http://localhost:3000` (or `3001`), or deploy previews to Vercel or Netlify — no backend change is needed for either. Other localhost ports are refused. Only `https` preview addresses match; a custom domain attached to a preview does not.

If the production store will live on a domain outside `sribees.com`, the backend owner must add it to production's allowed origins before launch.

---

## 5. Authentication and profile

Customers sign in with a **phone OTP**, **Google** or **Apple**. There is no email-and-password sign-in, no "register" endpoint and no password reset. The first successful sign-in creates the account.

### 5.1 Phone OTP sign-in

**Step 1 — request a code**

```http
POST /auth/phone/request-otp
{ "phone": "0771234567" }
```

Accepted phone formats: `0771234567`, `771234567`, `94771234567`, `+94771234567`. Only Sri Lankan mobile numbers are accepted; anything else is a `422`.

```json
{
  "success": true,
  "message": "We sent a 6-digit code to +94 77 *** **67",
  "expiresInSeconds": 180,
  "resendInSeconds": 300,
  "codeLength": 6,
  "destination": "+94 77 *** **67",
  "channel": "sms"
}
```

Build the code screen from this response: `codeLength` input boxes, a resend button disabled for `resendInSeconds`, and `destination` as the "sent to" label.

Sending limits (enforced by the server; you only need to handle the errors):

| Rule | Value | Error |
|---|---|---|
| Resend cooldown per number | 5 minutes | `429 OTP_RESEND_TOO_SOON` |
| Per number | 5 per hour, 10 per day | `429 OTP_TOO_MANY_REQUESTS` |
| Per IP address | 10 per hour | `429 OTP_TOO_MANY_REQUESTS` |
| Whole-server daily budget | Set by the admin | `503 OTP_SMS_UNAVAILABLE` |

Each carries `error.retry_after` in seconds and a translated `error.message`.

**Step 2 — verify and sign in**

```http
POST /auth/phone/verify-otp
{ "phone": "0771234567", "code": "123456" }
```

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": null,
    "fullName": "",
    "phone": "+94771234567",
    "nic": null,
    "alternatePhone": null,
    "profilePictureUrl": null,
    "isVerified": false,
    "isPhoneVerified": true,
    "twoFactorEnabled": false,
    "createdAt": "2026-10-07T08:15:30+00:00",
    "updatedAt": "2026-10-07T08:15:30+00:00",
    "lastLogin": "2026-10-07T08:15:30+00:00",
    "missingProfileFields": ["full_name", "nic", "email"]
  },
  "tokens": { "accessToken": "eyJ…", "refreshToken": "eyJ…" }
}
```

A wrong, used or expired code answers `400 OTP_INVALID`. Five wrong guesses burn the code; requesting a new one does not reset the counter.

### 5.2 Google and Apple sign-in

```http
POST /auth/social/login
{ "provider": "google", "id_token": "<the provider's ID token>", "nonce": "<raw nonce, optional>", "full_name": "Optional display-name hint" }
```

The response is the same `AuthResponse` as above. The server verifies the ID token against the provider's keys itself; a rejected token answers `401 { "detail": "…" }`.

- **Google.** Read `sign_in.google_server_client_id` from `GET /app/app-config` and use it as the client id for Google Identity Services. The token you post must be issued to that client id.
- **Apple.** `sign_in.apple_services_id` is the Services ID. If you pass a nonce to Apple, post its raw value as `nonce`.
- `full_name` is only a display-name hint (Apple gives the name to the client once and never puts it in the token).

Both providers need web-side configuration that does not exist yet — see open item 4 in [section 17](#17-web-specific-gaps-and-open-questions).

### 5.3 Tokens

| Token | Lifetime (default) | Use |
|---|---|---|
| `accessToken` | 15 minutes | `Authorization: Bearer …` |
| `refreshToken` | 7 days | `POST /auth/refresh` only |

```http
POST /auth/refresh
{ "refresh_token": "eyJ…" }
```

```json
{ "success": true, "message": "Token refreshed successfully", "tokens": { "accessToken": "eyJ…", "refreshToken": "eyJ…" } }
```

The response contains a **new refresh token**. Store both and discard the old pair.

Client rules:

1. Refresh proactively shortly before the access token's `exp`.
2. On a `401` from a protected call, refresh once and retry the original request once.
3. If the refresh itself fails, clear the tokens and send the user to sign-in.
4. Run only one refresh at a time; queue concurrent requests behind it.

### 5.4 Completing the profile

A new account has no name, email or NIC. **An account is one record, whichever client created it**: a customer who registers on the web and later signs in on the mobile app with the same number gets the same account, with everything they already saved. So the web and the app follow one rule, and the server states it.

Every `UserResponse` carries `missingProfileFields` — the fields this account still owes before sign-up is finished, in asking order:

```json
"missingProfileFields": ["full_name", "nic", "email"]
```

| The list | What the client does |
|---|---|
| Not empty | Show the "finish sign-up" step. Ask **only** for the fields named in it. |
| Empty | Sign-up is finished. Do not show the step, and do not ask for any of these again at sign-in. |

Rules that keep the two clients from overwriting each other:

1. **Decide from the server's answer after every sign-in**, never from what the browser remembers. Do not keep a "registered" flag or a copy of the profile in `localStorage` as the source of truth; read `user` from the sign-in response or `GET /auth/me`.
2. **Send only the fields the customer just filled in.** A `PATCH /auth/me` that repeats `full_name` replaces the name the customer saved on the other device.
3. **Never ask for `nic` when the account has one.** It is write-once; show it read-only.
4. **Save what the sign-up form collects with `PATCH /auth/me` before treating the customer as registered.** A name or NIC that only lives in the browser does not exist for the app, which will then ask for it.
5. Changes made later — by the customer in account settings on either client, or by support — are changes to that one record. Re-read `GET /auth/me` when the account page opens and after a `401`-refresh; do not show a cached copy.

*Servers that predate this field* (production, until the release reaches it) send no `missingProfileFields`. Fall back to: incomplete while **any of `fullName`, `email` or `nic` is empty** — the same three, in the same order.

```http
GET /auth/me                → { "success": true, "user": { …UserResponse } }
PATCH /auth/me              → same shape
```

`PATCH` body (send only what changes):

| Field | Rules |
|---|---|
| `full_name` | 2–100 characters |
| `email` | Must be unique. Required before a card payment — the gateway needs it. Conflict → `400 DUPLICATE_ERROR` (`field: "email"`). |
| `nic` | Sri Lankan NIC: 9 digits + `V`/`X`, or 12 digits, encoding a real birth date. **Write-once** — a second attempt answers `400 VALIDATION_ERROR` with `errors.nic`. Must be unique among live accounts → `400 DUPLICATE_ERROR` (`field: "nic"`). |
| `phone` | **Do not send it.** The main number changes only through the verified flow in [5.5](#55-changing-the-main-phone-number); a different value here answers `400 VALIDATION_ERROR` with `errors.phone`. |
| `alternate_phone` | A second delivery contact; must differ from `phone`. Send `""` to remove it. |
| `profile_picture_url` | Max 500 characters. |

### 5.5 Changing the main phone number

*Not in production yet — live on the development server.* (Production still accepts `phone` in `PATCH /auth/me` until this release reaches it.)

The main number is changed by proving control of the **new** number. A Google or Apple sign-up, which starts with no number, adds its first one the same way.

```http
GET /auth/phone/change-status
```

```json
{ "success": true, "dailyRemaining": 2, "monthlyRemaining": 4, "dailyLimit": 2, "monthlyLimit": 4, "canChange": true }
```

A customer may change their number twice a day and four times a month. Hide or disable the "Change number" action when `canChange` is `false`. Adding a first number does not count against the quota.

```http
POST /auth/phone/change-request     { "newPhone": "0719876543" }
                                    → the OTP challenge shape from 5.1; the code goes to the new number

POST /auth/phone/verify-change      { "newPhone": "0719876543", "otp": "123456" }
                                    → { "success": true, "user": { …UserResponse with the new phone } }
```

| Error | Meaning |
|---|---|
| `400 VALIDATION_ERROR`, `errors.new_phone` | Not a Sri Lankan mobile, the same as the current number, or not the number the code was requested for |
| `400 VALIDATION_ERROR`, `errors.daily` / `errors.monthly` | Quota used up; the message says when to try again |
| `400 DUPLICATE_ERROR`, `field: "phone"` | The number belongs to another account |
| `400 OTP_INVALID` | Wrong or expired code |
| `429` / `503` OTP codes | The sending limits in [5.1](#51-phone-otp-sign-in) apply here too |

To re-verify the number already on the account (for example when `isPhoneVerified` is `false`):

```http
POST /auth/request-otp      (no body)     → the same challenge shape as 5.1
POST /auth/verify-otp       { "code": "123456" }
                                          → { "success": true, "isPhoneVerified": true, "message": "Phone number verified" }
```

### 5.6 Sessions and sign-out

| Call | Effect |
|---|---|
| `POST /auth/logout` | Ends this session |
| `POST /auth/logout-others` | Ends every other session |
| `POST /auth/logout-all` | Ends every session, including this one |
| `GET /auth/sessions` | `{ success, sessions: [{ sessionId, device, ipAddress, userAgent, createdAt, lastActive, isCurrent }] }` |
| `DELETE /auth/sessions/{session_id}` | Revokes one other session |

All answer `{ "success": true, "message": "…" }` unless shown otherwise.

### 5.7 Closing an account

Account closure is confirmed by OTP to the account's phone.

```http
POST /auth/account/deletion/request-otp    (no body)  → challenge shape as 5.1
POST /auth/account/deletion/confirm        { "code": "123456", "reason": "optional, max 500" }
                                           → { "success": true, "message": "Your account has been closed." }
```

An account with no phone number answers `400` asking the user to add one or contact support. After closure, discard the tokens.

---

## 6. Delivery location and branch context

### 6.1 The location picker

Three cascading lists. All three are public.

```http
GET /locations/provinces?include_upcoming=true
```

```json
{
  "success": true,
  "total": 9,
  "data": [
    { "province": "Western", "displayName": { }, "available": true, "comingSoon": false,
      "districtCount": 3, "postalCityCount": 212, "branchCount": 4,
      "coverageSummary": "Western is served by 4 branch(es)…" }
  ]
}
```

Without `include_upcoming`, only places we deliver to are listed. With it, every province and district is listed and the locked ones have `available: false`, `comingSoon: true` — show them disabled with a "Coming soon" label.

```http
GET /locations/districts?province=Western&include_upcoming=true
```

Each row: `district`, `province`, `displayName`, `available`, `comingSoon`, `postalCityCount`, `branchNames`, `coverageSummary`.

```http
GET /locations/postal-cities?district=Colombo
```

Each row: `postalCity`, `district`, `province`, `branchId`, `branchName`, `isActive`.

`displayName` holds the localized names for the place; render it defensively and fall back to `province` / `district`.

### 6.2 Setting the context

**Guest, or a customer with no saved address:**

```http
POST /branch/resolve-by-location
{ "province": "Western", "district": "Colombo", "postal_city": "Nugegoda" }
```

**Customer choosing one of their saved addresses:**

```http
POST /session/set-location
{ "addressId": "8d1f…" }
```

Both answer:

```json
{
  "success": true,
  "message": "Branch resolved: Nugegoda",
  "data": {
    "branchId": "3c9a…",
    "branchName": "Nugegoda",
    "postalCity": "Nugegoda",
    "deliveryInfo": { "province": "Western", "district": "Colombo", "postal_city": "Nugegoda" },
    "resolvedAt": "2026-10-07T08:15:30+00:00"
  }
}
```

If no branch serves the place: `404 LOCATION_NOT_SERVED`.

### 6.3 After sign-in

The guest context does not transfer. Immediately after a successful sign-in:

1. Call `GET /session/location`. A `200` means this customer already has a context from an earlier session — use it.
2. On `404`, set one: `POST /session/set-location` with their default address if they have one, otherwise repeat `POST /branch/resolve-by-location` with the triplet the guest had chosen.

### 6.4 Other context calls

| Call | Auth | Purpose |
|---|---|---|
| `GET /session/location` | Required | Current context, or `404` |
| `GET /branch/context` | Required | Same data, same `404` |
| `POST /branch/clear` | Required | Forget the context |
| `GET /branch/public/{branch_id}` | Public | `{ branchId, branchName, district }` for a label |

There is no "read my context" call for guests. Keep the guest's chosen triplet in `localStorage`, and if a catalog call answers `NO_BRANCH_CONTEXT`, re-post it.

---

## 7. Catalog

Every endpoint in this section except categories and reviews needs a branch context. All are available to guests.

### 7.1 Categories

```http
GET /categories?top_level_only=true
GET /categories?hierarchical=true
GET /categories/{id-or-slug}
```

Flat list item:

```json
{ "category_id": "…", "name": "Vegetables", "slug": "vegetables", "description": "…",
  "image_url": "https://api.sribees.com/uploads/categories/veg-a1b2.jpg",
  "parent_category_id": null, "is_active": true, "product_count": 48 }
```

Response: `{ success, data: { categories: [...] } }`. With `hierarchical=true` each node also has `children: [...]` (and see the image note in [4.8](#48-images)).

Categories work without a branch context. Once a context exists, categories hidden for that branch are left out automatically.

### 7.2 Product lists

| Endpoint | Purpose | Query |
|---|---|---|
| `GET /products` | Browse with filters | `page`, `limit`, `category_id`, `subcategory_id`, `is_featured`, `search`, `min_price`, `max_price`, `sort_by` (`created_at` \| `price` \| `name` \| `view_count`), `sort_order` (`asc` \| `desc`) |
| `GET /products/search?q=` | Search | `q` (1–200 chars), `page`, `limit` |
| `GET /products/category/{category_id}` | One category and its sub-categories | `page`, `limit` |
| `GET /products/featured` | Featured strip | `limit` (max 50) |
| `GET /products/home-feed` | Quick Sale — the highest discounts at this branch | `limit` (max 100) |

`category_id` matches the category and everything under it; `subcategory_id` narrows to one leaf.

Search understands Sinhala, Tamil and romanized spellings ("Singlish"), and tolerates typos. Send what the customer typed; do not pre-process it.

Paginated response:

```json
{
  "success": true,
  "data": {
    "products": [ { "…": "Product" } ],
    "pagination": { "total": 137, "page": 1, "limit": 20, "pages": 7 },
    "branch": { "branchId": "3c9a…", "branchName": "Nugegoda" }
  }
}
```

`featured` returns `{ products }`; `home-feed` returns `{ products, branch, total }`; `search` adds `query`.

Only products that are active **and in stock** at the branch are returned. An out-of-stock product simply disappears from lists.

### 7.3 The Product object

```json
{
  "product_id": "b7e2…",
  "name": "Red Onions 1kg",
  "slug": "red-onions-1kg",
  "description": "…",
  "short_description": "…",
  "sku": "VEG-ONI-001",
  "price": 420.0,
  "compare_at_price": 480.0,
  "discount_percentage": 10,
  "discount_price": 378.0,
  "is_on_sale": true,
  "cashback_percentage": 2.5,
  "stock_quantity": 37,
  "is_returnable": true,
  "is_perishable": true,
  "weight": 1.0,
  "weight_unit": "kg",
  "is_active": true,
  "is_featured": false,
  "view_count": 1204,
  "average_rating": 0,
  "review_count": 0,
  "category_id": "…",
  "subcategory_id": null,
  "category": { "category_id": "…", "name": "Vegetables", "slug": "vegetables", "image_url": "https://…" },
  "subcategory": null,
  "images": [ { "image_id": "…", "image_url": "https://…", "alt_text": null, "is_primary": true, "sort_order": 0 } ],
  "has_variants": false,
  "variants": [],
  "created_at": "2026-09-01T04:00:00+00:00",
  "updated_at": "2026-10-06T11:20:00+00:00"
}
```

| Field | Meaning |
|---|---|
| `price` | This branch's price before any discount |
| `discount_percentage` | The branch's discount, or `null` / `0` |
| `discount_price` | `price` after the discount; `null` when there is none |
| `compare_at_price` | Optional "was" price for strike-through |
| `is_on_sale` | The branch's Quick Sale flag |
| `cashback_percentage` | What the customer earns on this product here, as a percent |
| `stock_quantity` | Stock at this branch; cap the quantity stepper at it |
| `is_returnable` | Whether the item can be returned after delivery |
| `global_price`, `branch_price`, `global_cashback_percentage` | Admin fields. Ignore. |

`average_rating` and `review_count` are filled only on the product detail call; lists return `0`.

### 7.4 Product detail

```http
GET /products/{id-or-slug}
GET /products/{id-or-slug}/variants
```

Detail returns one Product under `data`, with `variants` filled and the rating fields populated. A product not sold at this branch answers `404 PRODUCT_NOT_FOUND` even if it exists elsewhere.

Variant: `{ variant_id, name, sku, price, compare_at_price, stock_quantity, image_url, is_active }`.

### 7.5 Banners

```http
GET /banners?limit=10
```

```json
{ "success": true, "data": { "total": 3, "branch": { "branchId": "…", "branchName": "…" },
  "banners": [ { "bannerId": "…", "title": "Avurudu offers", "subtitle": "…", "imageUrl": "https://…",
                 "linkType": "category", "targetId": "…" } ] } }
```

`linkType` is `category`, `product`, `quick_sale` or `null`. `quick_sale` has no `targetId` — link it to the Quick Sale page. Scheduled banners appear and disappear on their own.

Report impressions and clicks so the marketing dashboard stays accurate:

```http
POST /banners/events
{ "sessionKey": "<random string per page load>",
  "events": [ { "bannerId": "…", "eventType": "impression" }, { "bannerId": "…", "eventType": "click" } ] }
```

Answers `202 { success, data: { recorded } }`. Batch up to 50 events. Never let a failure here affect the page.

---

## 8. Addresses

Sign-in required.

| Call | Purpose |
|---|---|
| `GET /user/addresses` | `{ success, data: [Address] }`, default first |
| `POST /user/addresses` | Create → `201 { success, data: Address, message }` |
| `PUT /user/addresses/{address_id}` | Partial update |
| `PUT /user/addresses/{address_id}/set-default` | Make default |
| `DELETE /user/addresses/{address_id}` | Delete |

Create body:

```json
{ "title": "Home", "recipient_name": "Nimal Perera", "phone": "0771234567",
  "address_line1": "12 Temple Road", "address_line2": null,
  "province": "Western", "district": "Colombo", "postal_city": "Nugegoda",
  "postal_code": "10250", "is_default": true }
```

`province`, `district` and `postal_city` must be values from the location endpoints in [6.1](#61-the-location-picker). The customer's first address becomes the default automatically.

Address object: everything above plus `address_id`, `branch_id`, `branch_name` and two flags:

| Flag | Meaning |
|---|---|
| `is_serviceable` | A branch sells to this postal city |
| `delivery_available` | The courier delivers to this postal city |

Both must be `true` for checkout to succeed. Show a quiet "not deliverable yet" indication on addresses where either is `false`.

---

## 9. Cart

Sign-in required. The cart lives on the server, so it follows the customer across devices.

### 9.1 Guest carts

There is no server-side guest cart. Keep a guest's cart in `localStorage`, and after sign-in hand it over once:

```http
POST /cart/merge
{ "items": [ { "product_id": "…", "variant_id": null, "quantity": 2, "price": 378.0, "name": "Red Onions 1kg", "image": "https://…", "sku": "VEG-ONI-001" } ] }
```

Then clear the local copy and use the server cart.

### 9.2 Endpoints

| Call | Body / query | Notes |
|---|---|---|
| `GET /cart` | `?address_id=` optional | Prices delivery to that address instead of the default |
| `POST /cart/items` | see below | Add a line or increase it |
| `PUT /cart/items/{product_id}` | `{ "quantity": 3 }`, `?variant_id=` | `0` removes the line |
| `DELETE /cart/items/{product_id}` | `?variant_id=` | Remove a line |
| `DELETE /cart` | — | Empty the cart |
| `GET /cart/count` | — | `{ data: { count } }` for the header badge |
| `POST /cart/coupon` | `{ "code": "WELCOME10" }` | Apply a coupon |
| `DELETE /cart/coupon` | — | Remove it |
| `POST /cart/validate` | — | Pre-checkout check |

Add-to-cart body:

```json
{ "product_id": "b7e2…", "quantity": 1, "name": "Red Onions 1kg", "price": 378.0,
  "image": "https://…", "sku": "VEG-ONI-001", "variant_id": null,
  "category_id": "…", "original_price": 420.0, "cashback_percentage": 2.5 }
```

`product_id`, `quantity`, `name` and `price` are required. The `price` is a display hint only; the server reprices every line from the catalogue.

Asking for more than the branch has answers `400 { "detail": "Only 3 items available in stock for this branch" }`.

### 9.3 The Cart object

Every cart call returns the whole cart, freshly priced:

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "items": [
      { "product_id": "b7e2…", "variant_id": null, "quantity": 2, "price": 378.0, "name": "Red Onions 1kg",
        "image": "https://…", "sku": "VEG-ONI-001", "category_id": "…", "original_price": 420.0, "cashback_percentage": 2.5 }
    ],
    "totals": { "subtotal": 756.0, "discount": 0, "tax": 0, "shipping": 250.0, "cashback_earned": 18.9, "total": 1006.0 },
    "coupon": null,
    "delivery": { "status": "quoted", "available": true, "fee": 250.0, "message": null,
                  "address_id": "8d1f…", "postal_city": "Nugegoda" },
    "updated_at": 1791360000
  }
}
```

Items may carry extra server-computed fields. Ignore fields you do not recognise.

**Reading the delivery block.** `totals.shipping` is `0` both when delivery is free and when it could not be priced. `delivery.available` is what tells them apart:

| `delivery.status` | `available` | Show |
|---|---|---|
| `quoted` | `true` | The fee |
| `no_address` | `false` | `delivery.message` — "Add a delivery address to see the delivery charge." |
| `not_serviceable` | `false` | `delivery.message` — "We don't deliver to this postal city yet." |
| `unavailable` | `false` | `delivery.message` — try again shortly |
| `empty_cart` | `false` | Nothing |

**Things the server does to the cart on its own:**

- `GET /cart` lowers a quantity to the available stock, and removes a line whose stock reached zero. Compare the returned cart with what was on screen and tell the customer if something changed.
- An applied coupon that is no longer valid is removed silently; `coupon` comes back `null`.

`coupon`, when present: `{ code, discount_type, discount_value, max_discount_amount, min_order_value, discount_amount }`.

### 9.4 Validating before checkout

```http
POST /cart/validate
```

```json
{ "success": true, "data": { "valid": false, "items": [], "totals": { },
  "delivery": { "status": "not_serviceable", "available": false, "message": "We don't deliver to this postal city yet." },
  "issues": [ { "code": "delivery_not_serviceable", "message": "We don't deliver to this postal city yet." } ] } }
```

Block the "Checkout" button while `valid` is `false` and show `issues[].message`.

---

## 10. Coupons

Use one endpoint for everything coupon-related. It returns cards ready to draw.

```http
POST /coupons/evaluate
```

| Body | Use it for |
|---|---|
| `{}` | The Offers page, with no order in mind. Works for guests. |
| `{ "use_cart": true }` | Choosing a coupon for the whole cart |
| `{ "items": [ { "product_id": "…", "variant_id": null, "quantity": 2 } ] }` | Choosing a coupon for selected lines, or Buy Now |
| add `"applied_code": "WELCOME10"` | Also report on the coupon already applied |
| add `"include_offers": false` | Only report on `applied_code`; skip the list |

With `items` or `use_cart`, the caller must be signed in (`401` otherwise).

```json
{
  "success": true,
  "data": {
    "basket": true,
    "notice": null,
    "sections": [ { "key": "eligible", "title": "Ready to use" }, { "key": "locked", "title": "Not for this order" } ],
    "coupons": [
      {
        "coupon_id": "…", "code": "WELCOME10", "label": "10% off", "description": "…",
        "terms": [ "Minimum order Rs. 1,500", "Vegetables only" ],
        "valid_until": "2026-10-31T18:29:59+00:00",
        "section": "eligible", "action": "use", "applied": false, "collected": true, "eligible": true,
        "status": { "key": "ready", "text": "…" },
        "dimmed": false, "reason": null,
        "estimated_discount": 75.6, "saving": "You save Rs. 75.60",
        "tier": null
      }
    ],
    "applied": { "code": "WELCOME10", "label": "10% off", "eligible": true, "discount": 75.6, "saving": "You save Rs. 75.60", "reason": null }
  }
}
```

Rendering rules:

- Group cards by `section`, in the order given by `sections`. Section keys: `eligible`, `collect`, `locked`, `wallet`.
- `action` decides the button: `use` → apply it (`POST /cart/coupon`), `collect` → save it (`POST /coupons/collect`), `remove` → `DELETE /cart/coupon`, `null` → no button.
- Fade a card when `dimmed` is `true`. Show `reason` when present — it explains why the coupon does not apply.
- `status.key` is one of `ready`, `applied`, `used`, `ended`, `locked`.
- `tier` (`{ name, color }`) marks members-only coupons.
- `notice` is a hint such as "select items first"; show it above the list.

Saving a coupon for later:

```http
POST /coupons/collect     { "code": "WELCOME10" }   → { success, data: {coupon}, message: "Offer added to My Coupons" }
```

`GET /coupons/available` and `GET /coupons/collected` are older raw lists. Prefer `evaluate`.

---

## 11. Checkout and payments

### 11.1 The flow

```
 cart ──► pick address ──► POST /orders/quote ──► pick payment ──► POST /orders
                              (repeat on any change)                   │
                                                 ┌─────────────────────┴───────────────────┐
                                        COD or wallet covers all                  online method
                                                 │                                         │
                                         order is placed                       status: awaiting_payment
                                                                                           │
                                                                    send customer to payment_action.url
                                                                                           │
                                                              POST /payments/orders/{id}/complete
                                                                                           │
                                                                    outcome: paid | failed | pending
```

### 11.2 Payment methods

```http
GET /payment-methods
```

```json
{ "success": true, "data": { "methods": [
  { "code": "COD",        "name": "Cash on Delivery",              "description": "Pay the rider in cash when your order arrives", "icon": "cash",   "kind": "offline" },
  { "code": "WALLET",     "name": "SRIBEES Wallet",                "description": "Pay from your wallet balance",                   "icon": "wallet", "kind": "wallet"  },
  { "code": "MARX_OTHER", "name": "Visa / Mastercard / UnionPay",  "description": "Pay securely by debit or credit card",           "icon": "card",   "kind": "online"  }
] } }
```

Draw exactly this list. Methods are switched on and off on the server; never hardcode them. Method names stay in English in every language by the owner's decision.

| `kind` | How to draw it | What to send |
|---|---|---|
| `offline` | A selectable method | `payment_method: <code>` |
| `online` | A selectable method | `payment_method: <code>` |
| `wallet` | A **"Use wallet balance" toggle**, not a method | `use_wallet: true`, optionally `wallet_amount` |

`icon` is one of `cash`, `wallet`, `card`, `bank`, `other` — map each to your own icon.

When the wallet toggle is on and the quote's `total` is `0`, the wallet covers the whole order: send the wallet method's `code` as `payment_method`.

### 11.3 Quote

Call this whenever the address, payment method, wallet toggle or coupon changes. It changes nothing on the server.

```http
POST /orders/quote
{ "delivery_address_id": "8d1f…", "payment_method": "COD", "use_wallet": true, "wallet_amount": 200, "coupon_code": "WELCOME10" }
```

For Buy Now or a subset of cart lines, add `"items": [ { "product_id", "variant_id", "quantity", "price", "name" } ]` and `"is_buy_now": true`. Without `items`, the whole server cart is quoted.

```json
{
  "success": true,
  "data": {
    "subtotal": 756.0, "delivery_fee": 250.0, "discount": 75.6, "tax": 0, "wallet_deduction": 200.0,
    "cashback_earned": 17.01, "total": 730.4, "currency": "LKR",
    "delivery_status": "quoted", "delivery_available": true, "delivery_message": null,
    "delivery": { "status": "quoted", "available": true, "fee": 250.0, "message": null, "address_id": "8d1f…", "postal_city": "Nugegoda" },
    "cashback_rate": 0.0225, "wallet_balance": 540.0, "wallet_applied": true, "item_count": 2,
    "coupon": { "code": "WELCOME10", "label": "10% off", "applied": true, "discount": 75.6, "reason": null }
  }
}
```

- `delivery_available: false` means checkout will be refused. Show `delivery_message` and disable "Place order".
- `coupon.applied: false` with a `reason` means the coupon will not take effect. Show the reason, and **do not send that `coupon_code` with the order** — the customer should pay exactly what the quote showed.
- The delivery fee can differ between `COD` and online methods, which is why `payment_method` is part of the quote.

### 11.4 Place the order

```http
POST /orders
```

```json
{
  "delivery_address_id": "8d1f…",
  "contact_phone": "0771234567",
  "alternate_phone": "0719876543",
  "payment_method": "COD",
  "use_wallet": false,
  "coupon_code": "WELCOME10",
  "notes": "Ring the bell twice",
  "is_buy_now": false
}
```

| Field | Rules |
|---|---|
| `delivery_address_id` | Required. One of the customer's addresses. |
| `contact_phone`, `alternate_phone` | **Both required**, both Sri Lankan mobiles, and they must differ. Pre-fill from the profile's `phone` and `alternatePhone`. |
| `payment_method` | A `code` from `GET /payment-methods`. Default `COD`. |
| `use_wallet`, `wallet_amount` | Wallet toggle and an optional custom amount. Omit `wallet_amount` to use the full balance. |
| `coupon_code` | Optional. |
| `items`, `is_buy_now` | As in the quote. Omit `items` to order the whole cart. |
| `notes` | Optional. |
| `delivery_slot_date`, `delivery_slot_time` | Optional. The current mobile app does not send them — see open item 8. |

Success is `201` with the full [Order object](#122-the-order-object) plus `payment_action`. For COD and wallet-covered orders `payment_action` is `null` and the order is placed. Fetch the cart again afterwards.

Refusals are `400 { "detail": "…" }` with a customer-readable message. The common ones:

| Message (English) | Cause |
|---|---|
| `Cart is empty` | Nothing to order |
| `Invalid delivery address` | The address is not this customer's |
| `We don't deliver to this postal city yet.` | Address not serviceable |
| `Stock changed for X. Only N available. Your cart has been updated.` | Stock moved since the cart was loaded — reload the cart |
| `X is currently out of stock and was removed from your cart.` | Same — reload the cart |
| `X is no longer available. Please remove it and try again.` | Product withdrawn |
| `This payment method is not available right now.` | Method switched off since the list was loaded |
| A coupon reason | The coupon stopped being valid |
| `Please add your email in Profile before paying by card or bank transfer.` | Online payment needs `email` on the profile |

A `422` here usually means the two phone numbers are the same or malformed.

### 11.5 Paying online on the web

For an online method, the order is created in status `awaiting_payment`. Its stock, coupon and wallet money are held, but it is not yet placed. The response carries:

```json
"payment_action": {
  "type": "redirect",
  "url": "https://…the gateway's hosted payment page…",
  "return_url": "https://api.sribees.com/api/v1/payments/marx/return",
  "complete_path": "/payments/orders/1f0c…/complete"
}
```

**How the mobile app does it:** it opens `url` in an in-app WebView, watches for navigation to `return_url`, intercepts it, and posts the full URL it landed on:

```http
POST /payments/orders/{order_id}/complete
{ "return_url": "https://api.sribees.com/api/v1/payments/marx/return?trId=…&merchantRID=…" }
```

```json
{ "success": true, "message": "Payment successful", "data": { "…Order": "…", "outcome": "paid" } }
```

`outcome` is `paid`, `failed` or `pending`. `success` is `true` only for `paid`. All three answer HTTP `200`. The server never trusts the returned URL — it only uses it to find which attempt to ask the gateway about, then asks the gateway directly.

**Why this does not work on the web as it stands:** a browser cannot intercept a top-level redirect. After paying, the customer lands on `return_url`, which is a static page on the API host that says "return to the app". The web store never sees the `trId` and `merchantRID` it needs for `/complete`.

**What is needed (backend work, not yet done):** the return page must send web customers back to the storefront with the query string intact — for example to `https://<store>/checkout/return?order=…&trId=…&merchantRID=…` — so the storefront can call `/complete`. Raise this with the backend owner before starting the payment screens.

**Interim option, no backend change:** open `url` in a new tab and poll `GET /orders/{order_id}` every few seconds from the original tab. A background worker settles unanswered attempts with the gateway on its own: it runs every minute and picks up attempts that are at least two minutes old, so expect a wait of two to three minutes. Watch `payment.state`:

| `payment.state` | Meaning | UI |
|---|---|---|
| `processing` | Waiting for payment | Spinner, `payment.message`, "Pay now" if `can_pay` |
| `paid` | Money received, order placed | Success page |
| `failed` | Declined | `payment.message`, "Try again" if `can_pay` |
| `not_completed` | The hold expired and the order was cancelled | `payment.message` |

This works but is slow and awkward. Treat it as a stopgap.

**Paying again.** While `payment.can_pay` is `true`, the customer can retry with the same or another online method:

```http
POST /payments/orders/{order_id}/pay
{ "method": "MARX_OTHER" }          // optional; omit to reuse the order's method
```

Answers `{ success, data: { payment_action } }`. Limits: the hold lasts about 60 minutes from order creation (`payment.pay_by` has the exact deadline) and an order allows 5 attempts. After the hold, the order is cancelled and everything held is released. Errors are `400 { detail }`, or `502` when the gateway cannot be reached.

Money that arrives late — a second attempt paid after the first, or a payment after cancellation — is credited to the customer's wallet automatically.

---

## 12. Orders

Sign-in required for everything in this section.

### 12.1 Endpoints

| Call | Accepts | Purpose |
|---|---|---|
| `GET /orders` | `?page`, `?limit`, `?status` | Order history (summaries) |
| `GET /orders/{id}` | Order id **or order number** | Full order |
| `GET /orders/{id}/tracking` | Order id only | Live courier tracking |
| `POST /orders/{id}/cancel` | Order id only, `?reason=` | Cancel |
| `POST /orders/{id}/return/images` | Order id only, multipart | Upload one return photo |
| `POST /orders/{id}/return` | Order id only | Request a return |
| `GET /orders/{id}/invoice` | Order id only | PDF invoice |
| `GET /orders/{id}/reorder` | Order id or number | Reorder preview |
| `POST /orders/{id}/reorder` | Order id or number | Put lines back in the cart |

Order numbers look like `FC-20261007-A1B2C3`.

### 12.2 The Order object

```json
{
  "order_id": "1f0c…",
  "order_number": "FC-20261007-A1B2C3",
  "status": "out_for_delivery",
  "status_label": "Out for Delivery",
  "payment": {
    "method": { "code": "COD", "name": "Cash on Delivery", "icon": "cash" },
    "state": "on_delivery", "title": "Pay on delivery", "message": null, "tone": "info",
    "can_pay": false, "pay_label": null, "pay_by": null
  },
  "payment_status": "pending",
  "payment_method": "COD",
  "subtotal": 756.0, "tax_amount": 0, "shipping_amount": 250.0, "discount_amount": 75.6,
  "wallet_deduction": 0, "cashback_earned": 17.01, "total_amount": 930.4,
  "coupon_code": "WELCOME10",
  "notes": null,
  "show_delivery_code": false,
  "delivery_verification_code": null,
  "delivery_verification_status": null,
  "courier_tracking_status": "out_for_delivery",
  "courier_waybill_number": "SBX0012345",
  "can_cancel": true,
  "cancel_state": "fee",
  "cancel_refund_amount": 0,
  "cancel_courier_fee": 250.0,
  "cancel_wallet_charge": 250.0,
  "return_window_expires_at": null,
  "refund_amount": null,
  "status_timeline": [
    { "status": "pending",   "label": "Order Placed", "timestamp": "2026-10-07T03:10:00+00:00", "completed": true,  "current": false },
    { "status": "confirmed", "label": "Confirmed",    "timestamp": "2026-10-07T03:10:05+00:00", "completed": true,  "current": false },
    { "status": "delivered", "label": "Delivered",    "timestamp": null,                         "completed": false, "current": false }
  ],
  "delivery_address": { "address_id": "8d1f…", "address_line1": "12 Temple Road", "address_line2": null,
                        "postal_city": "Nugegoda", "district": "Colombo", "province": "Western", "postal_code": "10250" },
  "items": [
    { "order_item_id": "…", "product_id": "b7e2…", "variant_id": null, "product_name": "Red Onions 1kg",
      "product_sku": "VEG-ONI-001", "product_image": "https://…", "quantity": 2, "unit_price": 378.0, "subtotal": 756.0,
      "tax_amount": 0, "is_reviewed": false, "is_returnable": true, "cashback_percentage": 2.5, "cashback_earned": 18.9 }
  ],
  "item_count": 2,
  "created_at": "2026-10-07T03:10:00+00:00",
  "updated_at": "2026-10-07T06:40:00+00:00",
  "shipped_at": "2026-10-07T05:00:00+00:00",
  "delivered_at": null,
  "cancelled_at": null
}
```

The object has more fields than shown (return tracking, gateway status, cashback state). The ones above are what the storefront screens need.

`status` values: `awaiting_payment`, `pending`, `confirmed`, `processing`, `packing`, `packed`, `ready_for_pickup`, `handed_to_courier`, `shipped`, `out_for_delivery`, `delivered`, `delivery_failed`, `rto_initiated`, `cancelled`, `return_requested`, `return_approved`, `return_rejected`, `refunded`. The timeline of a returned order can also show an `rto_delivered` step ("Returned to Branch"). Treat any value you do not recognise as a neutral state and show its `status_label`.

Use `status` for logic and icons, and **always display `status_label`** — it is translated and stays correct when new statuses are added.

`payment.tone` is `success`, `info`, `warning` or `error` — map it to a colour. `payment.state` values: `paid`, `on_delivery`, `processing`, `failed`, `not_completed`, `refunded`, `pending`.

**The handover code.** For prepaid orders the rider asks the customer for a code at the door. When `show_delivery_code` is `true`, show `delivery_verification_code` prominently. Never show it otherwise.

**List items** (`GET /orders`) are a lighter summary: `order_id`, `order_number`, `status`, `status_label`, `payment`, `payment_status`, `total_amount`, `cashback_earned`, `item_count`, `created_at`, `show_delivery_code`, `delivery_verification_code`, `courier_tracking_status`, and `items` with `product_id`, `product_name`, `product_image`, `quantity`, `unit_price`, `subtotal`.

### 12.3 Tracking

```http
GET /orders/{order_id}/tracking
```

```json
{ "success": true, "data": { "courier_tracking_status": "out_for_delivery", "courier_waybill_number": "SBX0012345",
  "courier_tracking_url": "https://…", "cod_collected": false, "handover_verified": false, "failure_note": null, "history": [] } }
```

The server refreshes from the courier at most once per 60 seconds per order, so polling faster gains nothing. Before a courier is booked, both status fields are `null`.

### 12.4 Cancelling

The order tells you what to draw:

| `cancel_state` | Button | Confirmation dialog must say |
|---|---|---|
| `free` | Normal "Cancel order" | Everything paid is returned: `cancel_refund_amount` |
| `fee` | **Red** "Cancel order" | The parcel is already booked with the courier; the delivery charge `cancel_courier_fee` is kept. If `cancel_wallet_charge` > 0, that amount is taken from the wallet. |
| `blocked` | No button | — |

`can_cancel` is `false` exactly when the state is `blocked`. The amounts are only accurate on the order **detail** call, so open the dialog from the detail page.

```http
POST /orders/{order_id}/cancel?reason=Ordered%20by%20mistake
```

`reason` is a **query parameter**, not a body field. Success returns the updated order. Refunds go to the Sribees Wallet in the same transaction. An order that can no longer be cancelled answers `400 { detail }`.

### 12.5 Returns

A delivered order can be returned within a **12-hour window**. `return_window_expires_at` holds the deadline; `null` means no return is offered. Show a countdown, and hide the return option once it passes. Only lines with `is_returnable: true` can be returned.

**Step 1 — upload photos, one request each (max 4):**

```http
POST /orders/{order_id}/return/images
Content-Type: multipart/form-data
file=<JPEG, PNG or WebP, at most 5 MB>
```

```json
{ "success": true, "data": { "path": "/uploads/returns/1f0c…/photo-a1b2.jpg", "url": "https://…/uploads/returns/1f0c…/photo-a1b2.jpg" } }
```

Use `url` for the thumbnail. Keep `path` for step 2.

**Step 2 — submit the request:**

```http
POST /orders/{order_id}/return
{ "reason": "Damaged on arrival", "comments": "Two tins dented",
  "items": [ { "order_item_id": "…", "quantity": 1 } ],
  "images": [ "/uploads/returns/1f0c…/photo-a1b2.jpg" ] }
```

`reason` and `images` are required, and `images` needs **at least one photo and at most four** — a return cannot be requested without a picture of the goods. Only `path` values returned by step 1 for this same order are accepted. Leave `items` out to return the whole order. Success returns the order, now `return_requested`.

**Step 3 — follow the decision.** The branch approves or rejects the request, and the order moves to `return_approved` or `return_rejected`. `status_timeline` then lists the return steps after "Delivered" (Return Requested, then Return Approved or Return Rejected, the pickup, and Refund Completed). On a rejection, show `return_resolution_note` — it is the branch's explanation to the customer — and `return_rejected_at`. `return_resolution` says how an approved return is being settled. (`return_rejected` and these three fields are *not in production yet*.)

### 12.6 Invoice

`GET /orders/{order_id}/invoice` returns `application/pdf` with a `Content-Disposition: attachment` header. It needs the bearer token, so a plain `<a href>` will not work — fetch it as a blob and trigger the download from script.

### 12.7 Reorder

```http
GET  /orders/{id}/reorder      → { data: { items: [ …each past line with today's price, stock and a capped quantity… ] } }
POST /orders/{id}/reorder      { "items": [ { "order_item_id": "…", "quantity": 2 } ] }
                               → { data: { cart: Cart, unavailable_items: [...] }, message }
```

Omit the body to re-add the whole order. Unavailable lines are skipped and listed in `unavailable_items`.

---

## 13. Wallet, loyalty and referrals

Sign-in required.

### 13.1 Wallet

```http
GET /wallet
```

```json
{ "balance": 540.0, "currency": "LKR", "cashback_rate": 0.02, "pending_cashback": 17.01, "points": 12,
  "tier": { "tier_id": "…", "name": "Silver", "min_points": 10, "color": "#9CA3AF" },
  "next_tier": { "tier_id": "…", "name": "Gold", "min_points": 50, "color": "#F59E0B", "points_needed": 38 } }
```

Note: this response has no `success` / `data` wrapper.

```http
GET /wallet/transactions?page=1&page_size=20&type=earned
```

`type` filters to `earned`, `spent` or `refund`. Response: `{ success, data: { transactions: [{ transaction_id, type, title, amount, balance_after, order_id, order_number, created_at }], total, page, page_size } }`.

```http
GET /wallet/pending
```

Cashback that is earned but not yet spendable: `{ success, data: { total, items: [{ order_id, order_number, amount, stage, available_at }] } }`. `stage` is `awaiting_delivery`, `return_window` or `return_in_progress`.

**How cashback behaves** — worth explaining in the UI: cashback on an order is held until the order's return window closes after delivery, then credited. A cancelled order's cashback is reversed.

### 13.2 Loyalty

```http
GET /wallet/loyalty
```

`{ success, data: { points, tier, next_tier, tiers: [...], spend_per_point, spend_to_next_point } }`. `tiers` is the whole ladder for a progress display. `spend_to_next_point` is in rupees.

### 13.3 Referrals

| Call | Purpose |
|---|---|
| `GET /referrals/me` | The Invite Friends screen in one call |
| `GET /referrals/friends/{friend_user_id}` | Commissions earned from one friend |
| `POST /referrals/redeem` | `{ "referral_code": "ABC123" }` — attach to an inviter. Write-once. |
| `POST /referrals/claim` | Move claimable commission into the wallet |

`GET /referrals/me` → `{ referralCode, commissionPercent, currency, totals: { pending, claimable, paid }, friendCount, friends: [...] }`.

`POST /referrals/claim` → `{ data: { claimedCount, amount }, message }`. It is safe to call twice; the second call claims nothing.

Sign-up takes no invite code, so offer "Have an invite code?" once after a new account is created and call `redeem`.

---

## 14. Wishlist and reviews

### 14.1 Wishlist

Sign-in required.

| Call | Purpose |
|---|---|
| `GET /wishlist` | `{ data: { items: [...], count } }` — each item embeds a product summary priced for the current branch |
| `POST /wishlist/toggle/{product_id}` | Add or remove; answers `{ data: { product_id, in_wishlist } }`. Best fit for a heart button. |
| `POST /wishlist` | `{ "product_id": "…", "variant_id": null, "price_at_watch": 378.0 }` |
| `DELETE /wishlist/{product_id}` | Remove |
| `GET /wishlist/check/{product_id}` | `{ data: { product_id, in_wishlist } }` |
| `GET /wishlist/price-drops` | Saved items whose price fell: `{ data: { price_drops, count } }` |
| `DELETE /wishlist` | Clear all |

All take an optional `?variant_id=`.

### 14.2 Reviews

```http
GET /products/{product_id}/reviews?page=1&page_size=10&sort_by=newest
```

Public. `product_id` must be the UUID here, not the slug. `sort_by`: `newest`, `highest`, `lowest`.

```json
{ "reviews": [ { "review_id": "…", "product_id": "…", "user_id": "…", "user": { "full_name": "Nimal P." },
                 "rating": 5, "title": "Fresh", "comment": "…", "is_verified_purchase": true,
                 "helpful_count": 0, "created_at": "2026-10-05T09:00:00+00:00" } ],
  "total": 14, "average_rating": 4.6, "rating_distribution": { } }
```

Writing a review requires a delivered purchase:

```http
POST /products/{product_id}/reviews
{ "rating": 5, "title": "Fresh", "comment": "…", "order_item_id": "<the delivered order line>" }
```

`201` returns the review. `409` — already reviewed. `403` — the order line is not this customer's. `404` — not found. On a delivered order, each line's `is_reviewed` tells you whether to show "Write a review" or "Reviewed".

---

## 15. Notifications, support, app config, chat

### 15.1 Notification inbox

Sign-in required. Push delivery is mobile-only today (see open item 7); the web store can show the inbox.

| Call | Purpose |
|---|---|
| `GET /notifications?page&limit&unread_only` | `{ data: { notifications: [...], pagination } }` |
| `GET /notifications/unread-count` | `{ data: { unread_count } }` for the bell badge |
| `PATCH /notifications/{id}/read` | Mark one read |
| `PUT /notifications/read-all` | Mark all read |
| `DELETE /notifications/{id}` / `DELETE /notifications` | Delete one / all |
| `GET /notifications/preferences` | `{ data: { offers, promotions, general, language } }` |
| `PUT /notifications/preferences` | Any of those four fields |

Notification: `{ notification_id, type, title, message, reference_type, reference_id, data, is_read, read_at, created_at }`. Use `reference_type` and `reference_id` to link to the related order or product.

The three switches govern marketing messages only. Order, payment and refund updates always arrive.

### 15.2 Support

```http
POST /support/tickets
{ "contact_phone": "0771234567", "message": "My order arrived without the rice.", "category": "order", "customer_name": "Nimal" }
```

Works for guests. `category`: `general`, `order`, `delivery`, `app`, `payment`. `message` is 5–500 characters. The customer may give any phone number to be called back on.

`201 { success, ticket_id, ticket_number, message }` — ticket numbers look like `TKT-20261007-A1B2C`.

```http
GET /support/my-tickets
```

`{ items: [{ ticket_id, ticket_number, category, message, status, branch_name, contact_phone, resolution_notes, created_at, updated_at, resolved_at }], total }`. A signed-in customer sees their account's tickets; a guest sees tickets filed from the same `X-Device-Id`.

```http
GET /app/support-info      → { data: { supportPhone, supportEmail } }
```

Use this for the contact details on every public page rather than hardcoding them.

### 15.3 App config and content

```http
GET /app/app-config
```

```json
{ "success": true, "data": {
  "minimum_version": "1.4.0", "latest_version": "1.6.2", "update_url": "https://play.google.com/…",
  "maintenance": { "active": false, "message": null },
  "flags": { },
  "splash": null,
  "sign_in": { "google_server_client_id": "…apps.googleusercontent.com", "apple_services_id": "…", "apple_redirect_uri": "…" }
} }
```

On the web: honour `maintenance.active` (show `maintenance.message` and stop), read `sign_in`, and ignore the version fields — they gate mobile builds. Cached for 60 seconds on the server.

```http
GET /app/content/{page}?lang=si
```

Owner-editable pages whose text lives in the database. `{ data: { page, lang, content, updated_at } }`, where `content` is a JSON document. The first page is `developer` ("About the developer"). A hidden or unknown page answers `404` — hide the link. Render defensively: draw the sections that exist and tolerate missing fields, because the owner edits this content directly.

Static legal pages are served as HTML on the API host, outside `/api/v1`: `/privacy` and `/account-deletion`.

### 15.4 Knowing when to refetch

```http
GET /app/sync-state
```

```json
{ "success": true, "data": { "catalog": "42.17", "banners": "9", "offers": "23", "user": "311", "content": "4", "push_topic": "…" } }
```

Each value is an opaque version string. Compare with the last value you saw; when one changes, refetch that group: `catalog` (products, categories), `banners`, `offers` (coupons), `user` (this customer's orders, wallet, loyalty points, notifications), `content` (app content pages). `user` is `null` for guests. A `null` value means "unknown — refetch".

Polling this every few minutes, and when the tab regains focus, keeps the store fresh cheaply.

### 15.5 AI shopping assistant

Optional feature. Works for guests.

| Call | Purpose |
|---|---|
| `POST /chat/message` | One turn, answered in full |
| `POST /chat/message/stream` | The same turn with progress events |
| `POST /chat/confirm` | `{ "token": "<32 hex>" }` — confirm an action the assistant proposed. Sign-in required. |
| `GET /chat/history` / `DELETE /chat/history` | Read / clear the conversation |

Request: `{ "message": "ingredients for kiribath", "image_base64": null, "image_mime_type": null }`. A photo (JPEG, PNG or WebP, up to 4 MB, base64 without a `data:` prefix) is optional. Unknown fields are rejected.

The reply (`data`) carries `reply` (text), `language`, `products` (Product objects to show as cards), `orders`, `actions`, `panels` and `guide`. The assistant answers in the language of the message, not the UI language.

Streaming is `text/event-stream` over a `POST`, so use `fetch` with a stream reader, not `EventSource`:

```
event: stage    data: {"stage":"understanding" | "searching" | "orders" | "preparing", "terms":[…]}
event: done     data: <the same payload /chat/message returns>
event: error    data: {"code":"TIMEOUT" | "AI_UNAVAILABLE" | "INTERNAL", "message":"…"}
```

Limits: 12 messages per minute; one turn at a time per session (`409` if another is in progress); a turn that takes over 55 seconds fails with `503`.

### 15.6 Presence heartbeat (who is on the web store)

```http
POST /app/usage/heartbeat
```

```json
{ "device_id": "web_3f2b9c1e-...", "event": "open", "foreground_seconds": 0, "platform": "web" }
```

Works for guests; send the Bearer token when signed in (the customer is read from the token, never the body). `device_id` is one id per browser (`web_` + a UUID kept in localStorage; 8-80 chars of `A-Z a-z 0-9 _ . : -`). `event` is `open` when the tab comes on screen, `beat` every 2 minutes while it stays on screen, `background` when it is hidden or closed. `foreground_seconds` is the time the tab was visible since the previous report (capped at 3600 per report). Answers `202`. Unknown fields are rejected (`422`). The server names the browser from its User-Agent. Feeds the Super Admin "App Users" page (Web filter). The store does this in `src/hooks/useWebPresence.ts`.

---

## 16. Endpoint index

**Auth** — `G` works for guests, `U` needs sign-in, `G/U` works for both (and behaves per caller).

| Method | Path | Auth | Section |
|---|---|---|---|
| POST | `/auth/phone/request-otp` | G | 5.1 |
| POST | `/auth/phone/verify-otp` | G | 5.1 |
| POST | `/auth/social/login` | G | 5.2 |
| POST | `/auth/refresh` | G | 5.3 |
| GET, PATCH | `/auth/me` | U | 5.4 |
| GET | `/auth/phone/change-status` | U | 5.5 |
| POST | `/auth/phone/change-request`, `/auth/phone/verify-change` | U | 5.5 |
| POST | `/auth/request-otp`, `/auth/verify-otp` | U | 5.5 |
| POST | `/auth/logout`, `/auth/logout-all`, `/auth/logout-others` | U | 5.6 |
| GET | `/auth/sessions` | U | 5.6 |
| DELETE | `/auth/sessions/{session_id}` | U | 5.6 |
| POST | `/auth/account/deletion/request-otp`, `/auth/account/deletion/confirm` | U | 5.7 |
| GET | `/locations/provinces`, `/locations/districts`, `/locations/postal-cities` | G | 6.1 |
| POST | `/branch/resolve-by-location` | G/U | 6.2 |
| POST | `/session/set-location` | U | 6.2 |
| GET | `/session/location`, `/branch/context` | U | 6.4 |
| POST | `/branch/clear` | U | 6.4 |
| GET | `/branch/public/{branch_id}` | G | 6.4 |
| GET | `/categories`, `/categories/{id-or-slug}` | G/U | 7.1 |
| GET | `/products`, `/products/search`, `/products/featured`, `/products/home-feed` | G/U | 7.2 |
| GET | `/products/category/{category_id}` | G/U | 7.2 |
| GET | `/products/{id-or-slug}`, `/products/{id-or-slug}/variants` | G/U | 7.4 |
| GET | `/banners` | G/U | 7.5 |
| POST | `/banners/events` | G/U | 7.5 |
| GET, POST | `/user/addresses` | U | 8 |
| PUT, DELETE | `/user/addresses/{address_id}` | U | 8 |
| PUT | `/user/addresses/{address_id}/set-default` | U | 8 |
| GET, DELETE | `/cart` | U | 9 |
| POST | `/cart/items` | U | 9 |
| PUT, DELETE | `/cart/items/{product_id}` | U | 9 |
| GET | `/cart/count` | U | 9 |
| POST, DELETE | `/cart/coupon` | U | 9 |
| POST | `/cart/merge`, `/cart/validate` | U | 9 |
| POST | `/coupons/evaluate` | G/U | 10 |
| POST | `/coupons/collect` | U | 10 |
| GET | `/coupons/available`, `/coupons/collected` | G/U | 10 |
| GET | `/payment-methods` | U | 11.2 |
| GET | `/delivery/slots` | G/U | 17 (item 8) |
| POST | `/orders/quote` | U | 11.3 |
| POST | `/orders` | U | 11.4 |
| POST | `/payments/orders/{order_id}/complete`, `/payments/orders/{order_id}/pay` | U | 11.5 |
| GET | `/orders`, `/orders/{id}` | U | 12 |
| GET | `/orders/{id}/tracking`, `/orders/{id}/invoice`, `/orders/{id}/reorder` | U | 12 |
| POST | `/orders/{id}/cancel`, `/orders/{id}/return`, `/orders/{id}/return/images`, `/orders/{id}/reorder` | U | 12 |
| GET | `/wallet`, `/wallet/transactions`, `/wallet/pending`, `/wallet/loyalty` | U | 13 |
| GET | `/referrals/me`, `/referrals/friends/{friend_user_id}` | U | 13.3 |
| POST | `/referrals/redeem`, `/referrals/claim` | U | 13.3 |
| GET, POST, DELETE | `/wishlist` | U | 14.1 |
| POST | `/wishlist/toggle/{product_id}` | U | 14.1 |
| GET | `/wishlist/check/{product_id}`, `/wishlist/price-drops` | U | 14.1 |
| DELETE | `/wishlist/{product_id}` | U | 14.1 |
| GET | `/products/{product_id}/reviews` | G | 14.2 |
| POST | `/products/{product_id}/reviews` | U | 14.2 |
| GET, DELETE | `/notifications` | U | 15.1 |
| GET | `/notifications/unread-count` | U | 15.1 |
| PATCH | `/notifications/{id}/read` | U | 15.1 |
| PUT | `/notifications/read-all` | U | 15.1 |
| DELETE | `/notifications/{id}` | U | 15.1 |
| GET, PUT | `/notifications/preferences` | U | 15.1 |
| POST | `/support/tickets` | G/U | 15.2 |
| GET | `/support/my-tickets` | G/U | 15.2 |
| GET | `/app/support-info`, `/app/app-config`, `/app/content/{page}` | G | 15.2–15.3 |
| GET | `/app/sync-state` | G/U | 15.4 |
| POST | `/chat/message`, `/chat/message/stream` | G/U | 15.5 |
| POST | `/chat/confirm` | U | 15.5 |
| GET, DELETE | `/chat/history` | G/U | 15.5 |
| POST | `/app/usage/heartbeat` | G/U | 15.6 |

---

## 17. Web-specific gaps and open questions

The API was built for a mobile app. These are the places where a web store needs something that is not there yet, or needs a decision. Items 1–4 need backend or owner action; settle them before the related screens are built.

| # | Gap | Impact | Who acts |
|---|---|---|---|
| 1 | **Online payment return.** The gateway returns the browser to an app-oriented page on the API host; the web store cannot get the `trId` / `merchantRID` it needs for `/complete`. | Card payments cannot finish cleanly on the web. COD and wallet are unaffected. Details and an interim workaround in [11.5](#115-paying-online-on-the-web). | Backend |
| 2 | **CORS for the production domain.** Development is open to localhost and to Vercel and Netlify previews ([4.10](#410-cors)). Production allows only `*.sribees.com`, `*.vercel.app` and its configured list. | A production store on any other domain is blocked by the browser. | Backend, once the domain is decided |
| 3 | **Rate limit is per IP per path** (100/min). | Server-side rendering or a backend-for-frontend makes all shoppers share one IP. Client-side fetching is safe today. | Decide the rendering approach; backend can exempt a server if needed |
| 4 | **Google and Apple sign-in on the web.** The Google OAuth client must list the web store's origin as an authorised JavaScript origin. `apple_redirect_uri` from app-config is an Android-only callback; Apple web sign-in needs the store's domain and return URL registered with Apple. | Social sign-in will fail on the web until configured. Phone OTP works now. | Owner (Google Cloud / Apple Developer consoles) |
| 5 | **No branch-less public catalog.** Every product call needs a branch context tied to a device id. | Product pages cannot be server-rendered for search engines without first inventing a device id and choosing a location. Decide: location-gate the store like the app, or ask for a default "showcase" branch. | Product decision, then possibly backend |
| 6 | **Usage heartbeat is mobile-only.** `POST /app/usage/heartbeat` accepts `platform: android \| ios` only. | Web visitors will not appear on the admin's "App Users" page. Do not call it from the web. | Backend, if web presence should be tracked |
| 7 | **Push notifications are mobile-only** (FCM device tokens). | No web push. Poll the inbox and `sync-state` instead. | Backend, if web push is wanted |
| 8 | **Delivery slots.** `GET /delivery/slots?days=2` returns dispatch rounds (`slotId`, `date`, `label`, `dispatchAt`, `orderBy`, `minutesToCutoff`, `isToday`, and `configured`), and `POST /orders` accepts `delivery_slot_date` / `delivery_slot_time` — but the current mobile checkout sends neither. | Unclear whether the web should offer slot selection, and what exact values to send. | Owner to confirm before building |
| 9 | **Product share links** (`https://<api-host>/p/{product_id}`) open the mobile app or the Play Store. | A "Share" button on the web probably wants a web product URL instead. | Product decision |
| 10 | **No published OpenAPI in production.** | Generate clients and run contract tests against the development server's `/openapi.json` instead ([2.1](#21-base-urls)). | — |

---

## 18. Endpoints you must not use

They exist under the same base URL and may show up in a schema dump, but they are not for the storefront.

| Endpoints | Why |
|---|---|
| Everything under `/admin/*` and `/partner/*` | Staff and partner realms with their own tokens. A customer token is refused. |
| `POST` / `PUT` / `DELETE` / `PATCH` on `/products…` and `/categories…` | Catalog administration; Super Admin only. |
| `/orders/admin/*`, `/notifications/admin/*`, `POST /payments/refund` | Admin operations. |
| `/payments/create-intent`, `/payments/confirm`, `/payments/status/{id}`, `/payments/cards…`, `/payments/history`, `/payments/webhook` | Left over from an earlier payment integration. Not part of the current flow. |
| `POST /payments/marx/confirm` | Legacy confirm call for old app builds. Use `/payments/orders/{id}/complete`. |
| `POST /auth/refresh-token` | Legacy alias of `/auth/refresh`. |
| `POST /cart/sync`, `GET /cart/sync/status` | Offline-first sync for the mobile app. |
| `POST /app/usage/heartbeat`, `GET /app/splash-config` | Mobile-only. |
| `/notifications/push-token…`, `/notifications/push/token`, `/notifications/campaigns/{id}/opened` | Mobile push plumbing. |
| `/courier/webhooks/*` | Server-to-server, signed by the courier. |
| `/branch/resolve` | Works, but `/session/set-location` does the same thing; use one. |

---

## 19. Appendix: TypeScript client skeleton

A minimal `fetch` wrapper that applies every convention in section 4. Adapt it to your stack; it is a starting point, not a library.

```ts
const BASE = import.meta.env.VITE_API_URL;              // must end in /api/v1

function deviceId(): string {
  let id = localStorage.getItem("sb_device_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sb_device_id", id); }
  return id;
}

let tokens: { accessToken: string; refreshToken: string } | null = null;   // decide your own storage
let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  if (!tokens) return false;
  refreshing ??= fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: tokens.refreshToken }),
  })
    .then(async (r) => {
      if (!r.ok) { tokens = null; return false; }
      tokens = (await r.json()).tokens;                 // BOTH tokens are new
      return true;
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit & { lang?: string } = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("X-Device-Id", deviceId());
  headers.set("X-Client-Platform", "web");
  headers.set("Accept-Language", init.lang ?? "en");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (tokens) headers.set("Authorization", `Bearer ${tokens.accessToken}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && tokens && !retried && (await refresh())) return api<T>(path, init, true);

  const body = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
  if (!res.ok) throw normalizeError(res.status, body);  // section 4.4
  return body as T;
}

// Usage
type Envelope<T> = { success: boolean; data: T; message?: string };
const { data } = await api<Envelope<{ products: Product[] }>>("/products?limit=20", { lang: "si" });
```

Where to keep the refresh token is your decision. It is a seven-day credential: storing it in `localStorage` exposes it to any script injected into the page, while moving it to an `httpOnly` cookie requires a server component of your own — which brings rate-limit item 3 into play.
