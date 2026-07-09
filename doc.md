# MilkBook — Technical Documentation

*Apna dudh, apna hisaab.* A PWA for milk delivery tracking between dairy sellers and their buyers.

---

## User Flows

### Seller / Buyer role-specific discovery flow
1. **Login** (`/login`) — OTP via Firebase Phone Auth.
2. **Role select** (`/role-select`) — writes `role: 'seller' | 'buyer'` to `users/{uid}`.
3. **Onboarding** (`/onboarding`) — sets profile `name` and metadata. Providing current GPS coordinates (`gpsLocation` & `geohash`) is **mandatory** for sellers who are open to selling and want to be searchable by nearby buyers.
4. **Nearby sellers** (`/buyer/nearby` or `/seller/nearby`) — geolocation-based seller discovery. The searching user **must** provide their current coordinates to query and display matching sellers in the 10km radius.

### MilkBook Shared Ledger flow
1. **Starting a MilkBook** — Any onboarded user (buyer or seller) can create a MilkBook. The creator inputs the partner's name, phone (optional), default quantities, and prices.
2. **Automatic Phone Linking** — If the partner's phone exists (or is registered later), the book is automatically shared with them in read-only mode.
3. **Daily Entries** — The creator logs morning/evening milk quantities in the book's detail view.
4. **Billing & Payments** — The creator records payments; billing totals and balances due calculate automatically.
5. **Viewer access** — The partner logs in and sees the book under "Shared Books" on their dashboard, viewing all calendars, summaries, and receipts in view-only mode.

---

## Firestore Collections (full schema)

### `users/{uid}`
```
role: 'seller' | 'buyer'
name: string
phone: string
about?: string
gpsLocation?: GeoPoint
geohash?: string
createdAt: Timestamp
```

### `sellers/{sellerId}`
```
openToSell: boolean
gpsLocation: GeoPoint
geohash: string
hasCow: boolean
hasBuffalo: boolean
hasGoat: boolean
hasCamel: boolean
```

### `milkbooks/{bookId}`
```
creatorId: string
partnerId: string | null
name: string               // Name entered by the creator
phone: string              // Phone of the partner
startDate: string | null
morning: { cow: number, buffalo: number, goat: number, camel: number }
evening: { cow: number, buffalo: number, goat: number, camel: number }
prices: { cow: number, buffalo: number, goat: number, camel: number }
status: 'active' | 'inactive'
createdAt: Timestamp
```

### `milkbooks/{bookId}/records/{recordId}`
Record ID convention: `{cattleType}_{YYYYMMDD}` — deterministic for idempotent writes.
```
date: Timestamp
cattleType: 'cow' | 'buffalo' | 'goat' | 'camel'
morning: number
evening: number
total: number
isAbnormal: boolean        // true if morning + evening quantity deviates
source: 'auto' | 'manual'
comment: string
manualEditedAt?: Timestamp
createdAt: Timestamp
```

### `milkbooks/{bookId}/payments/{paymentId}`
```
amount: number
date: Timestamp
note: string
addedBy: string            // creatorId
createdAt: Timestamp
```

### `linkRequests/{requestId}`
```
buyerId: string
sellerId: string
status: 'pending' | 'accepted' | 'rejected'
createdAt: Timestamp
```

---

## Service Layer

All Firestore access goes through `src/services/`. Never call Firestore directly from components.

| Service | Key exports |
|---|---|
| `milkbook.service.js` | `getMilkBooks`, `getMilkBook`, `addMilkBook`, `updateMilkBook`, `deleteMilkBook`, `getMilkBookRecords`, `saveMilkBookRecord`, `deleteMilkBookRecord`, `getMilkBookPayments`, `addMilkBookPayment`, `deleteMilkBookPayment`, `linkPendingMilkbooks`, `backfillMilkBookRecords` |
| `seller.service.js` | `getSellerProfile`, `updateSellerProfile` |
| `buyer.service.js` | `getBuyerProfile` |
| `billing.service.js` | `calcBillSummary(records, prices, payments)` |
| `location.service.js` | `saveUserLocation`, `getNearbySellers` (optimized using Geohash ranges with client-side role filtering) |

---

## Auto-Record System

Client-side auto-recording runs via dashboard hooks for active milkbooks created by the current user when opening the app.

---

## Billing Calculation

`billing.service.js → calcBillSummary(records, prices, payments)`:

```
totalLitres = sum of records[cattleType].total for the month
totalAmount = sum of (totalLitres × prices[cattleType]) (rounded to 2dp)
totalPaid   = sum of payment.amount for the month
remaining   = totalAmount - totalPaid
```

---

## Cattle Types

Defined in `src/utils/constants.js`:

| Value | English | Hindi |
|---|---|---|
| `cow` | Cow | गाय |
| `buffalo` | Buffalo | भैंस |
| `goat` | Goat | बकरी |
| `camel` | Camel | ऊंट |

---

## Routing Reference

| Path | Component | Guard |
|---|---|---|
| `/` | Landing | PublicRoute |
| `/login` | Login | PublicRoute |
| `/role-select` | RoleSelect | PrivateRoute (no role check) |
| `/onboarding` | Onboarding | PrivateRoute (no role check) |
| `/seller` | SellerDashboard | PrivateRoute role=seller |
| `/seller/settings` | SellerSettings | PrivateRoute role=seller |
| `/seller/nearby` | NearbySellers | PrivateRoute role=seller |
| `/buyer` | BuyerDashboard | PrivateRoute role=buyer |
| `/buyer/nearby` | NearbySellers | PrivateRoute role=buyer |
| `/buyer/profile` | BuyerProfile | PrivateRoute role=buyer |
| `/buyer/link-requests` | LinkRequest | PrivateRoute role=buyer |
| `/milkbooks/add` | AddEditMilkBook | PrivateRoute (authenticated) |
| `/milkbooks/:id` | MilkBookDetail | PrivateRoute (authenticated) |
| `/milkbooks/:id/edit` | AddEditMilkBook | PrivateRoute (authenticated) |

---

## Environment Variables

All Firebase config via `VITE_FIREBASE_*` in `.env`.

---

## Firestore Security Rules Summary

- `users`, `sellers` — any auth user can **read** (needed for nearby-seller discovery and phone match); only owner writes.
- `milkbooks` — creator has full CRUD; partner has read-only. Unauthenticated or unlinked users cannot view.
- `milkbooks/{id}/records`, `milkbooks/{id}/payments` — creator has write/delete; both creator and partner have read access.
- `linkRequests` — buyer creates; seller reads/updates.
