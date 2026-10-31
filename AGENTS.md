<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# E-Commerce Project — Agent Rules & Architecture Guidelines

You are working on a production-ready e-commerce application built with Next.js, TypeScript, Tailwind CSS, Zustand, Axios, and TanStack Query.

You MUST follow the architecture, folder structure, coding standards, and state-management rules defined below for every new feature, modification, refactor, and bug fix.

---

## 1. Core Technology Stack

The project uses:

* Next.js with App Router
* TypeScript
* React
* Tailwind CSS
* TanStack Query
* Zustand
* Axios
* React Hook Form
* Yup or the project's existing validation solution

Do not introduce another library for functionality that can already be handled by the existing stack.

Before adding a new dependency, check whether the project already has a suitable solution.

---

## 2. Required Project Structure

Follow this structure:

```text
src/
├── api/
│   ├── endpoints/
│   ├── services/
│   └── queries/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── base/
│   │   └── [BaseComponentName]/
│   │       └── index.tsx
│   └── [ComponentName]/
│       └── index.tsx
│
├── constants/
├── hooks/
├── interfaces/
├── state/
├── themes/
├── utils/
│
└── app/
    ├── [page]/
    │   ├── components/
    │   │   └── [PageSpecificComponent].tsx
    │   └── page.tsx
    ├── layout.tsx
    └── page.tsx
```

Do not create random top-level folders unless there is a clear architectural reason.

---

## 3. API Architecture

All backend communication MUST follow this flow:

```text
Component
    ↓
TanStack Query Hook
    ↓
API Service
    ↓
Axios
    ↓
Backend API
```

Never make direct Axios/API calls inside UI components.

### API Endpoints

Keep API paths inside `src/api/endpoints/`.

Examples: `product.endpoint.ts`, `category.endpoint.ts`, `order.endpoint.ts`, `auth.endpoint.ts`

Do not hardcode API URLs repeatedly throughout the application.

---

## 4. API Services

Raw API request functions must be placed inside `src/api/services/`.

Examples: `product.service.ts`, `category.service.ts`, `order.service.ts`, `auth.service.ts`

Services are responsible only for communicating with the backend (e.g. `getProducts()`, `getProductById()`, `createProduct()`, `updateProduct()`, `deleteProduct()`).

Do not put UI logic inside API services.

---

## 5. TanStack Query Rules

TanStack Query is the **PRIMARY** solution for server-state management.

Use TanStack Query for: Products, Categories, Brands, Product details, Orders, Customers, User profile data, Reviews, Inventory, Search results, Server-side filters, Pagination, and any data received from the backend.

Query hooks must be placed inside `src/api/queries/`.

```text
api/queries/
├── useProducts.ts
├── useProduct.ts
├── useCategories.ts
├── useOrders.ts
├── useCreateOrder.ts
└── useUpdateProduct.ts
```

Use:
* `useQuery` for fetching
* `useMutation` for create/update/delete operations
* Query keys for cache management
* Query invalidation after mutations
* Appropriate stale/cache configuration
* Pagination/infinite queries when required

Do **not** duplicate server data inside Zustand.

---

## 6. Zustand Rules

Zustand is **ONLY** for client-side/global UI state.

Use Zustand for: Shopping cart state, Wishlist client state, UI preferences, Sidebar state, Modal state, Selected local filters, Temporary checkout state, Client-only application state.

Keep Zustand stores inside `src/state/`.

```text
state/
├── cart.store.ts
├── wishlist.store.ts
├── ui.store.ts
└── checkout.store.ts
```

Do **NOT** use Zustand as a replacement for TanStack Query. If data comes from the backend, prefer TanStack Query.

---

## 7. Component Architecture

### Base Primitives — `src/components/base/[BaseComponentName]/index.tsx`

Small reusable UI primitives: `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Modal`, `Dialog`, `Dropdown`, `Badge`, `Spinner`, `Skeleton`, `Card`, `Table`.

Format: `src/components/base/[BaseComponentName]/index.tsx` (e.g. `src/components/base/Button/index.tsx`).

Base components must **NOT** contain business-specific logic (Product, Order, Checkout, Customer, etc.).

### Large Reusable Components — `src/components/[ComponentName]/index.tsx`

Large, app-wide reusable components (e.g. `Header`, `Footer`, `Navbar`, `SearchBar`, `ProductCard`, `Pagination`, `LoadingState`, etc.).

Format: `src/components/[ComponentName]/index.tsx` (e.g. `src/components/ProductCard/index.tsx`).

> **Note:** Do NOT create `common/` or `feature/` subdirectories inside `src/components/`.

### Page-Specific Components — `src/app/[page]/components/`

Components that belong strictly to a single page (used for breaking down a page into sub-views or page-specific logic) MUST be placed inside that page's route folder under `components/`.

Format: `src/app/[page]/components/[ComponentName].tsx` (or `src/app/[page]/components/[ComponentName]/index.tsx`).

Examples:
* `src/app/products/components/ProductFilters.tsx`
* `src/app/checkout/components/CheckoutSummary.tsx`

---

## 8. Hooks

Custom React hooks that are **not** TanStack Query hooks belong inside `src/hooks/`.

Examples: `useDebounce.ts`, `useMediaQuery.ts`, `useClickOutside.ts`, `useLocalStorage.ts`

TanStack Query hooks stay inside `src/api/queries/`. Do not duplicate the same hook in both locations.

---

## 9. Interfaces & Types

Shared TypeScript interfaces/models belong inside `src/interfaces/`.

Examples: `product.interface.ts`, `category.interface.ts`, `order.interface.ts`, `user.interface.ts`, `cart.interface.ts`

Use strong TypeScript types. Avoid `any`. Prefer `unknown` with proper type narrowing when the type is genuinely unknown. Do not unnecessarily duplicate the same interface across multiple files.

---

## 10. Constants

Application-wide constants belong inside `src/constants/`.

Examples: `routes.ts`, `queryKeys.ts`, `storageKeys.ts`, `status.ts`, `config.ts`

Do not repeatedly hardcode routes, query keys, local storage keys, status values, or configuration values.

---

## 11. Utils

Pure reusable utility functions belong inside `src/utils/`.

Examples: `formatCurrency.ts`, `formatDate.ts`, `slugify.ts`, `validation.ts`, `calculateDiscount.ts`

Utilities should be pure whenever possible. Do not put React-specific logic or API calls inside `utils/`.

---

## 12. Assets

Static assets belong inside `src/assets/` organized as:

```text
assets/
├── images/
├── icons/
└── fonts/
```

Use Next.js image optimization where appropriate.

---

## 13. Themes

Theme-related configuration belongs inside `src/themes/`. Keep colors, typography, design tokens, theme configuration, and reusable styling constants centralized.

---

## 14. Next.js App Router Rules

Pages/routes belong inside `src/app/`. Use route groups when they improve organization.

```text
app/
├── (shop)/
│   ├── products/
│   ├── categories/
│   └── cart/
├── checkout/
├── account/
└── admin/
```

Keep route-level components focused on composing features. Do not put large amounts of reusable business logic directly inside `page.tsx`.

---

## 15. Server vs Client Components

Use **Server Components by default**. Add `"use client"` only when the component needs: React state, event handlers, browser APIs, Zustand, TanStack Query, or client-side interactions.

Do not make the entire application a Client Component unnecessarily.

---

## 16. Forms

Use React Hook Form for complex forms. Keep validation schemas separate and reusable in `utils/validation.ts`.

Do not manually manage large forms using many independent `useState` calls when React Hook Form is more appropriate.

---

## 17. Loading & Error States

Every asynchronous UI must properly handle: Loading, Success, Empty, Error.

* Use Skeletons for loading where appropriate
* Use Empty states for no results
* Use user-friendly error messages
* Add Retry mechanisms where appropriate

Do not leave blank screens while API requests are loading.

---

## 18. E-Commerce Specific Architecture

The application is organized around these major business domains:

`Product` · `Category` · `Brand` · `Cart` · `Wishlist` · `Checkout` · `Order` · `Customer` · `Authentication` · `Payment` · `Inventory` · `Review` · `Search`

Each domain should keep its components, API service, query hooks, interfaces, and utilities organized logically.

---

## 19. Naming Conventions

| Type | Convention |
|---|---|
| Base Primitives | `src/components/base/[ComponentName]/index.tsx` |
| Reusable Components | `src/components/[ComponentName]/index.tsx` |
| Page Components | `src/app/[page]/components/[ComponentName].tsx` |
| Hooks | `useProducts.ts`, `useCreateOrder.ts` |
| Services | `product.service.ts`, `order.service.ts` |
| Interfaces | `product.interface.ts`, `order.interface.ts` |
| Stores | `cart.store.ts`, `ui.store.ts` |
| Utils | `formatCurrency.ts`, `formatDate.ts` |

Use descriptive names. Avoid: `data.ts`, `common.ts`, `helper.ts`, `stuff.ts`, `temp.ts`.

---

## 20. Reusability

Before creating a new component, hook, utility, or service:
1. Search the existing codebase.
2. Check whether a reusable implementation already exists.
3. Extend the existing implementation if appropriate.
4. Avoid unnecessary duplication.

---

## 21. Code Quality

Every implementation should prioritize: Readability, Maintainability, Reusability, Type safety, Separation of concerns, Performance, Accessibility, Responsive design.

Avoid unnecessary abstractions. Do not over-engineer simple functionality.

---

## 22. Before Creating New Files

1. Inspect the existing folder structure.
2. Search for similar functionality.
3. Reuse existing components/hooks/services where possible.
4. Follow the established naming convention.
5. Place the file in the correct architectural layer.

---

## 23. Before Modifying Existing Code

1. Understand the current implementation.
2. Identify dependencies and consumers.
3. Avoid breaking existing functionality.
4. Preserve existing API contracts unless intentionally changing them.
5. Reuse existing architecture.
6. Make the smallest clean change required.
7. Check TypeScript errors after modification.

---

## 24. Dependency Rules

1. Check `package.json` before installing anything.
2. Check whether the functionality already exists.
3. Prefer existing project dependencies.
4. Only add a new dependency when there is a clear benefit.

---

## 25. API Error Handling

Axios configuration/interceptors must be centralized. Do not implement separate authentication/token handling in every API service.

Handle: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Validation Error`, `500 Server Error`, `Network Error` — using the project's centralized API strategy.

---

## 26. Performance Rules

Avoid unnecessary re-renders, API requests, duplicate queries, large client components, global state, and heavy dependencies.

* Use TanStack Query caching effectively.
* Use pagination or infinite queries for large datasets.
* Use Next.js image optimization for product images.
* Lazy-load heavy components when appropriate.

---

## 27. Security Rules

Never expose secrets in client-side code. Never hardcode API secrets, private keys, database credentials, payment secrets, or authentication secrets.

Use environment variables. Only variables intended for the browser should use `NEXT_PUBLIC_`. Never store sensitive server credentials in `NEXT_PUBLIC_*`.

---

## 28. Responsive UI & Styling Conventions

The application must support: Mobile, Tablet, Desktop, Large Desktop.

* Use Tailwind responsive utilities. E-commerce components (product grids, cards, cart, checkout, navigation, filters) must work properly on mobile screens.
* **Tailwind Class Conventions**: Do NOT use arbitrary pixel values in square brackets (e.g., `w-[1400px]`, `h-[500px]`, `p-[20px]`). Use standard Tailwind sizing, spacing, and layout utility classes (e.g., `w-full`, `w-80`, `h-35`, `h-10`, `max-w-7xl`, `max-w-screen-2xl`, etc.). Standard numeric spacing and sizing scale classes (e.g., `h-35`, `w-80`, `p-6`) are completely allowed and encouraged over arbitrary bracket pixels.

---

## 29. Accessibility

Reusable UI components should follow accessibility best practices:
* Semantic HTML
* Proper labels
* Keyboard navigation
* Accessible buttons
* ARIA attributes when necessary
* Visible focus states

Do not use clickable `div` elements when a semantic `<button>` or `<a>` is appropriate.

---

## 30. Agent Behavior

When implementing a task, ALWAYS:

1. Inspect the existing project first.
2. Understand the current architecture.
3. Reuse existing code where possible.
4. Follow the folder structure defined above.
5. Use TanStack Query for server state.
6. Use Zustand only for client/global state.
7. Keep API calls inside the API layer.
8. Keep UI components focused on presentation and interaction.
9. Maintain strong TypeScript typing.
10. Avoid unnecessary dependencies.
11. Avoid unnecessary refactoring.
12. Preserve existing functionality.
13. Check for TypeScript/build errors after changes.
14. Ensure responsive and accessible UI using standard Tailwind utility classes (avoid arbitrary pixel values like `w-[1400px]`).
15. Keep code production-ready.

---

## 31. Golden Rule

```text
UI → Components → Hooks / TanStack Query → API Services → Axios → Backend
```

```text
SERVER STATE  → TanStack Query
CLIENT STATE  → Zustand
LOCAL UI STATE → React useState/useReducer
```

Always prefer a clean, scalable, feature-oriented architecture over quick but duplicated implementations.
