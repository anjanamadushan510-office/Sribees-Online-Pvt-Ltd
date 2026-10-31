# SRIBEES Online: web frontend

One Next.js app that serves the SRIBEES company website and the online store.

| Area | Route group | URLs | Notes |
|---|---|---|---|
| Company site | `src/app/(company)` | `/`, `/about`, `/become-partner` | Mostly server components, no store providers, English only |
| Online store | `src/app/(shop)` | `/shop`, `/product`, `/categories`, `/checkoutView`, ... | TanStack Query, Zustand, next-intl (en/si/ta) |

`/` is the landing page. Every "Shop Now" action links to `/shop` with a normal
client navigation, and `src/app/loading.tsx` shows a branded loader while the
store shell loads. `ROUTES.HOME` means the store home and `ROUTES.COMPANY` means
the landing page.

## Getting started

```bash
corepack enable
yarn install
cp .env.example .env.local
yarn dev
```

## Checks

```bash
yarn typecheck
yarn test
yarn build
yarn test:e2e
```

CI runs by manual dispatch only (`.github/workflows/ci.yml`).

## Conventions

Architecture rules are in [AGENTS.md](AGENTS.md). The backend contract is in
[WEB_STOREFRONT_API.md](WEB_STOREFRONT_API.md).
