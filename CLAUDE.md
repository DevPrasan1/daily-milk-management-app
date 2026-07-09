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

**MilkBook** is a PWA for milk delivery tracking between dairy sellers and buyers. While users select a role (`seller` or `buyer`) for discovery on the map, any user can create and maintain a **MilkBook** ledger.
- **Creator (Editor)**: The user who starts the milkbook has write/update access to its daily entries and payments.
- **Viewer (Read-Only)**: The partner user gets read-only view access automatically based on their phone number.

### Provider hierarchy

```
ThemeProvider → AuthProvider → AppProvider → Routes
```

- **AuthContext** (`src/context/AuthContext.jsx`) — wraps Firebase `onAuthStateChanged`; exposes `user`, `userProfile`, and `refreshProfile()`. Automatically runs `linkPendingMilkbooks()` on login to link any books pre-created with the user's phone.
- **AppContext** (`src/context/AppContext.jsx`) — global UI state via `useReducer`: toast queue, etc. Exposes `toast(message, type)` helper.
- **ThemeContext** — light/dark toggle persisted to `localStorage`.

### Routing & auth guards

`src/routes/PrivateRoute.jsx` checks in order: loading spinner → no user → no role → no name (onboarding). Routes authenticated users to their respective dashboards.
- Seller: `/seller`
- Buyer: `/buyer`
- Unified detail route: `/milkbooks/:milkbookId` (uses relation role-less creator/viewer permissions)
- Unified creation route: `/milkbooks/add`

### Firestore data model

All milk records and transaction histories are unified under the top-level `milkbooks` collection and its subcollections.

| Collection | Purpose |
|---|---|
| `users/{uid}` | Shared profile (role, name, phone, language) |
| `sellers/{sellerId}` | Seller discovery config (openToSell, GPS location, cattle types) |
| `milkbooks/{bookId}` | Unified shared ledger metadata (creatorId, partnerId, phone, default quantities, prices) |
| `milkbooks/{bookId}/records/{recordId}` | Daily morning/evening milk entries. IDs are deterministic (`{cattleType}_{YYYYMMDD}`) |
| `milkbooks/{bookId}/payments/{paymentId}` | Payment ledger added by the book's creator |
| `linkRequests/{requestId}` | Legacy/Alternative seller↔buyer linking requests |

### Service layer

All Firestore operations live in `src/services/`. Components never call Firestore directly.

- `milkbook.service.js` — unified MilkBook lifecycle, daily records, payment transaction CRUD, auto-linking logic, and backfill helpers.
- `seller.service.js` — seller profile and config management
- `buyer.service.js` — buyer profile management
- `billing.service.js` — bill summary calculation utilities
- `location.service.js` — geolocation queries for map discovery

### Auto-record system

Client-side auto-recording runs via the dashboard hooks for active milkbooks created by the current user where `autoMode=true`.

### Utilities

- `src/utils/milkUtils.js` — `calcTotal`, `calcAmount`, `formatLitres`, `formatAmount`, `isAbnormal`, `groupRecordsByDate`
- `src/utils/validators.js` — `validatePhone`, `validateOtp`, `validateName`, `validateQuantity`, `validatePrice`
- `src/utils/constants.js` — `ROLES`, `CATTLE_TYPES`, `CATTLE_OPTIONS`
- `src/utils/dateUtils.js`, `src/utils/shareUtils.js`

### i18n

English and Hindi translations in `src/i18n/en.json` and `hi.json`. Language stored in `localStorage` under key `milkbook_lang`.

### Styling & UI

Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Primary color is `#1D9E75`. UI primitives live in `src/components/ui/`.

### Firestore security rules

Rules are in `firestore.rules`. Key patterns:
- Any authenticated user can read `users` and `sellers` (required for map discovery and phone matching).
- `milkbooks` and their subcollections (`records`, `payments`) are readable by both the `creatorId` and the `partnerId`.
- Write/update access to a milkbook and its subcollections is restricted to the `creatorId`.
- Exception: A user with a matching phone number can update *only* the `partnerId` field of a milkbook to self-link upon registering.
