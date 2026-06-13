# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build
npm run lint         # ESLint

# Firebase
npx firebase emulators:start          # Run all emulators (auth:9099, firestore:8080, functions:5001, hosting:5000)
npx firebase deploy                   # Deploy hosting + functions + rules
npx firebase deploy --only hosting
npx firebase deploy --only functions
npx firebase deploy --only firestore  # Deploy rules/indexes only

# Functions (run from functions/ directory)
cd functions && npm install
```

No automated tests exist in this project.

## Architecture

**MilkBook** is a PWA for milk delivery tracking between sellers (dairy farmers) and buyers (customers). Two distinct user roles drive the entire data model and routing.

### Provider hierarchy

```
ThemeProvider → AuthProvider → AppProvider → Routes
```

- **AuthContext** (`src/context/AuthContext.jsx`) — wraps Firebase `onAuthStateChanged`; exposes `user` (Firebase auth object), `userProfile` (Firestore `/users/{uid}` doc), and `refreshProfile()`. Profile is fetched once on auth state change and re-fetched manually via `refreshProfile()` after mutations.
- **AppContext** (`src/context/AppContext.jsx`) — global UI state via `useReducer`: toast queue, `selectedBuyerId`, `selectedMonth`, `selectedCattle`. Exposes `toast(message, type)` helper (auto-dismisses at 3.5s).
- **ThemeContext** — light/dark toggle persisted to `localStorage`.

### Routing & auth guards

`src/routes/PrivateRoute.jsx` checks in order: loading spinner → no user → no role → no name (onboarding) → wrong role. `PublicRoute.jsx` redirects authenticated users to their dashboard. User flow after signup: `/login` → `/role-select` → `/onboarding` → `/seller` or `/buyer`.

### Firestore data model

All seller data is scoped under the seller's `uid`. Record IDs are deterministic (`{buyerId}_{cattleType}_{YYYYMMDD}`), enabling idempotent `setDoc(..., { merge: true })` writes.

| Collection | Purpose |
|---|---|
| `users/{uid}` | Shared profile (role, name, phone) |
| `sellers/{sellerId}` | Seller config (autoMode, homeDelivery, cattle types) |
| `sellerBuyers/{sellerId}/members/{buyerId}` | Buyer membership + auto-quantities per cattle |
| `sellerPrices/{sellerId}/prices/{priceId}` | Price history; global prices use IDs like `global_cow`, `global_buffalo` |
| `records/{sellerId}/entries/{recordId}` | Daily milk records written by seller |
| `buyerSelfRecords/{buyerId}/entries/{recordId}` | Buyer's own parallel records |
| `payments/{sellerId}/transactions/{paymentId}` | Payment ledger |
| `buyers/{buyerId}` | Buyer's own profile doc |
| `linkRequests/{requestId}` | Pending seller↔buyer link requests |

### Service layer

All Firestore operations live in `src/services/`. Components never call Firestore directly.

- `record.service.js` — daily milk record CRUD; `saveRecord` is idempotent via deterministic record IDs
- `seller.service.js` — seller profile, buyer members, prices
- `buyer.service.js` — buyer profile, nearby sellers
- `billing.service.js` — monthly bill computation
- `location.service.js` — geolocation for nearby-sellers feature
- `autoRecord.service.js` — client-side auto-record trigger (mirrors Cloud Function logic)

Custom hooks in `src/hooks/` wrap service calls with local state (`useSeller`, `useBuyer`, `useRecords`, etc.).

### Auto-record system

Two paths for automatic record creation:
1. **Cloud Functions** (`functions/index.js`): `autoCreateRecordsMorning` (08:00 IST = 02:30 UTC) and `autoCreateRecordsEvening` (20:00 IST = 14:30 UTC) — scheduled for sellers with `autoMode=true`.
2. **Client-side** (`useAutoRecord` hook): runs once per seller session via `runAutoRecordsForSeller()` to catch records the Cloud Function may have missed.

Records are flagged `isAbnormal: true` when actual quantity deviates >0.5L from set quantity (`src/utils/milkUtils.js` → `isAbnormal()`).

### Utilities

- `src/utils/milkUtils.js` — `calcTotal`, `calcAmount`, `formatLitres`, `formatAmount`, `isAbnormal`
- `src/utils/validators.js` — `validatePhone`, `validateOtp`, `validateName`, `validateQuantity`, `validatePrice`
- `src/utils/constants.js` — `ROLES`, `CATTLE_TYPES`, `CATTLE_OPTIONS` (cow/buffalo/goat/camel with Hindi labels), `SESSIONS`, `RECORD_SOURCE`, `LINK_STATUS`, `MEMBER_STATUS`
- `src/utils/dateUtils.js`, `src/utils/shareUtils.js`

### i18n

English and Hindi translations in `src/i18n/en.json` and `hi.json`. Language stored in `localStorage` under key `milkbook_lang`. Use `useTranslation()` from `react-i18next` in all components. When adding new UI strings, add keys to both files.

### Styling & UI

Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Primary color is `#1D9E75`. UI primitives (`Button`, `Input`, `Spinner`, etc.) live in `src/components/ui/`. Use `clsx` + `tailwind-merge` for conditional class merging. `@` resolves to `src/` throughout (configured in `vite.config.js`).

### Firestore security rules

Rules are in `firestore.rules`. Key patterns:
- Seller owns their subcollections (`records`, `sellerBuyers`, `sellerPrices`, `payments`)
- Buyers can read their own entries via `resource.data.buyerId == request.auth.uid`
- `users` and `sellers` collections are readable by any authenticated user (needed for nearby-seller discovery)
