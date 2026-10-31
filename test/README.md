# SRIBEEES Online — Automated E2E Testing Suite (Playwright)

## Overview
This directory contains the automated End-to-End (E2E) testing framework for **SRIBEES Online**, designed and structured according to **Senior QA Engineering** standards.

The automation framework is powered by **Playwright Test** and implements the **Page Object Model (POM)** pattern, test isolation fixtures, and deterministic API network interception.

---

## Directory Structure

```text
test/
├── e2e/
│   ├── order-flow.spec.ts                 # Core Order flow (Happy Path, Auth Gate, Address change, Item updates)
│   ├── checkout-payments-coupons.spec.ts  # Coupon validation, Wallet deductions & Split-Payment flows
│   ├── my-account.spec.ts                 # My Account (Profile view/edit, Tabs, Address listing, Guest warning)
│   └── account-settings.spec.ts           # Settings (Preferences, Notification toggles, Danger Zone modal)
│
├── fixtures/
│   ├── mockData.ts                        # Realistic, schema-accurate mock fixtures matching WEB_STOREFRONT_API.md
│   └── testFixtures.ts                    # Custom Playwright fixtures (authentication state, API mock routing)
│
├── pages/                                 # Page Object Model (POM)
│   ├── BasePage.ts                        # Common wait utilities, navigation, toast validations
│   ├── HomePage.ts                        # Catalog browsing, Cart trigger, item interactions
│   ├── CartDrawerPage.ts                  # Cart slide-over drawer, line items, checkout trigger
│   ├── CheckoutPage.ts                    # Order summary, address selection, payment modes, place order & confirmation
│   ├── MyAccountPage.ts                   # Profile cards, tab switcher, Edit Profile modal
│   └── AccountSettingsPage.ts             # Settings cards, notification toggles, Danger Zone modal
│
└── README.md                              # This test architecture and execution guide
```

---

## Test Scenarios Covered

| Test ID | Scenario | Type | Description |
|---|---|---|---|
| **TC-ORD-01** | Happy Path Order Flow | E2E | Authenticated user adds product to cart, opens drawer, proceeds to checkout, validates delivery address, selects Cash on Delivery (COD), places order, and verifies the Order Confirmation Modal with Order ID. |
| **TC-ORD-02** | Security Auth Gate | Negative / Security | Unauthenticated visitor attempting direct navigation to `/checkoutView` is blocked and prompted with the Sign In modal. |
| **TC-ORD-03** | Address Selection | Functional | Authenticated customer switches delivery address in the Address Modal and verifies delivery destination updates in checkout. |
| **TC-ORD-04** | Cart Adjustments | Functional | Customer adjusts item quantities and removes items inside checkout, validating reactive price/item count recalculations. |
| **TC-CHK-01** | Coupon Application | Functional | Customer applies promotional code (`SAVE200`), verifies discount deduction, and removes coupon. |
| **TC-CHK-02** | Wallet & Split Payment | Integration | Customer applies partial wallet balance, verifies requirement for secondary payment method, selects COD, and places order. |
| **TC-ACC-01** | Profile & Tab Navigation | Functional | Customer views profile name/points/tier and switches between Personal Info, Saved Addresses, and Wallet tabs. |
| **TC-ACC-02** | Edit Profile Modal | Functional | Customer opens Edit Profile modal, updates display name, and verifies update. |
| **TC-ACC-03** | Saved Addresses Listing | Functional | Customer verifies saved delivery addresses appear in the Saved Addresses tab. |
| **TC-ACC-04** | My Account Guest Warning | Security | Unauthenticated guest visiting `/myAccount` sees the guest mode warning banner. |
| **TC-SET-01** | Settings Overview | Functional | Authenticated user views settings cards (Localization, Notifications, Sessions, Danger Zone). |
| **TC-SET-02** | Notification Preferences | Functional | User toggles notification switches (Offers, Promotions, General). |
| **TC-SET-03** | Danger Zone & Modal | Security | User triggers the Delete Account confirmation modal and cancels safely. |
| **TC-SET-04** | Settings Guest Warning | Security | Unauthenticated guest visiting `/accountSettings` sees the demo mode warning banner. |

---

## Running the Tests

### 1. Run All E2E Tests (Headless)
```bash
yarn test:e2e
```

### 2. Run in Interactive UI Mode (Visual Debugger & Time-Travel)
```bash
yarn test:e2e:ui
```

### 3. Run in Headed Browser Mode
```bash
yarn test:e2e:headed
```

### 4. Run a Specific Test File
```bash
yarn playwright test test/e2e/order-flow.spec.ts
```

### 5. View Test Report
```bash
yarn test:e2e:report
```

---

## Mock Mode vs Live Backend Mode

By default, the tests use Playwright network interception via `page.route` to mock API responses deterministically using `test/fixtures/mockData.ts`. This ensures:
- **Zero test flakiness** caused by backend downtime or staging network latency.
- **No pollution of the live database** with dummy orders or test payments.
- **Blazing fast test runs** ideal for pull requests and CI/CD pipelines.

### Running Against Live Backend
If you want to test against the real backend API (e.g. on Staging or Dev environments):
```bash
E2E_USE_LIVE_API=true yarn test:e2e
```

---

## Best Practices Followed
1. **No Hardcoded Locators in Tests**: All UI selectors reside cleanly inside Page Object classes (`test/pages/`).
2. **Explicit User-Centric Assertions**: Tests assert on semantic user visible states (headings, modals, order IDs, toasts).
3. **Trace & Video on Failure**: Playwright is configured in `playwright.config.ts` to capture screenshots, traces, and video recordings when tests fail.
