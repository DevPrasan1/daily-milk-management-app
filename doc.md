# MilkBook — Technical Documentation

*Apna dudh, apna hisaab.* A PWA for milk delivery tracking between dairy sellers and their buyers.

---

## User Flows

### Seller flow
1. **Login** (`/login`) — OTP via Firebase Phone Auth
2. **Role select** (`/role-select`) — writes `role: 'seller'` to `users/{uid}` and creates `sellers/{uid}` doc
3. **Onboarding** (`/onboarding`) — sets `name`, `about`, `homeDelivery`; optionally sets global prices per cattle type in `sellerPrices/{uid}/prices/global_{type}`
4. **Dashboard** (`/seller`) — daily summary: total litres today, pending payments, buyer count
5. **Daily entry** (`/seller/entry`) — select buyer → enter morning/evening quantities per cattle type → saves to `records/{sellerId}/entries/{recordId}`
6. **Buyer management** (`/seller/buyers`) — add/edit/deactivate buyers; each buyer lives in `sellerBuyers/{sellerId}/members/{buyerId}`
7. **Billing** (`/seller/buyers/:buyerId`) — view monthly bill, record payments, share via WhatsApp

### Buyer flow
1. Login → role select (`role: 'buyer'`) → onboarding
2. **Dashboard** (`/buyer`) — summary across all linked sellers
3. **My records** (`/buyer/records`) — view records per seller per month; can also add self-entries to `buyerSelfRecords/{buyerId}/entries/`
4. **Nearby sellers** (`/buyer/nearby`) — geolocation-based seller discovery; sends `linkRequests` doc

---

## Firestore Collections (full schema)

### `users/{uid}`
```
role: 'seller' | 'buyer'
name: string
phone: string
about?: string
createdAt: Timestamp
```

### `sellers/{sellerId}`
```
autoMode: boolean          // triggers scheduled Cloud Functions
homeDelivery: boolean
cattle: string[]           // e.g. ['cow', 'buffalo']
location?: GeoPoint
```

### `sellerBuyers/{sellerId}/members/{buyerId}`
```
name: string
phone: string
status: 'active' | 'inactive'
autoMode: boolean          // include in auto-records
linkedUserId: string | null  // set when buyer links their account
morning: { cow: number, buffalo: number }
evening: { cow: number, buffalo: number }
addedAt: Timestamp
```

### `sellerPrices/{sellerId}/prices/{priceId}`
Price ID convention: `global_{cattleType}` for default prices, `{buyerId}_{cattleType}` for buyer-specific overrides.
```
buyerId: string | null     // null = global default
cattleType: 'cow' | 'buffalo' | 'goat' | 'camel'
pricePerLitre: number
totalMilk?: number         // litres/day this seller produces (set during onboarding)
fromDate: Timestamp
```

### `records/{sellerId}/entries/{recordId}`
Record ID: `{buyerId}_{cattleType}_{YYYYMMDD}` — deterministic for idempotent writes.
```
buyerId: string
date: Timestamp
cattleType: string
morning: number
evening: number
total: number
setMorning: number         // quantity auto-mode expected
setEvening: number
isAbnormal: boolean        // true if deviation > 0.5L from set quantity
source: 'auto' | 'manual' | 'buyer'
createdAt: Timestamp
```

### `buyerSelfRecords/{buyerId}/entries/{recordId}`
Same schema as `records` entries; buyer writes their own parallel records.

### `payments/{sellerId}/transactions/{paymentId}`
```
buyerId: string
amount: number
date: Timestamp
note: string
addedBy: string            // sellerId
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
| `record.service.js` | `getRecordsForMonth`, `getRecordsForMonthAllBuyers`, `saveRecord` (idempotent via deterministic ID) |
| `seller.service.js` | `getSellerProfile`, `getBuyers`, `addBuyer`, `updateBuyer`, `deleteBuyer`, `hasBuyerRecords`, `getSellerPrices`, `setPrice`, `getGlobalPriceId` |
| `buyer.service.js` | buyer profile, link request creation, nearby seller queries |
| `billing.service.js` | `getPayments`, `addPayment`, `calcBillSummary(records, pricePerLitre, payments)` |
| `location.service.js` | geolocation helpers |
| `autoRecord.service.js` | `runAutoRecordsForSeller()` — client-side duplicate of Cloud Function logic |

---

## Auto-Record System

Two parallel paths produce the same outcome:

**Cloud Functions** (`functions/index.js`):
- `autoCreateRecordsMorning` — cron `30 2 * * *` UTC (8:00 AM IST)
- `autoCreateRecordsEvening` — cron `30 14 * * *` UTC (8:00 PM IST)
- Queries all sellers with `autoMode=true`, then their active buyers with `autoMode=true`
- Iterates cattle types `['cow', 'buffalo']`, skips if both morning and evening quantities are 0
- Uses `batch.set` / `batch.update` with the deterministic record ID

**Client-side fallback** (`src/hooks/useAutoRecord.js`):
- Runs once per seller session via `runAutoRecordsForSeller()`
- Catches any records missed by the Cloud Function (network issues, cold-start delays)
- Same deterministic record ID means no duplicates

**Abnormal flag**: `isAbnormal` is set when `|actual - setQuantity| > 0.5L` for either morning or evening session.

---

## Billing Calculation

`billing.service.js → calcBillSummary(records, pricePerLitre, payments)`:

```
totalLitres = sum of record.total for the month
totalAmount = totalLitres × pricePerLitre (rounded to 2dp)
totalPaid   = sum of payment.amount for the month
remaining   = totalAmount - totalPaid
```

Price lookup order (to be implemented per buyer): buyer-specific price (`{buyerId}_{cattleType}`) → global default (`global_{cattleType}`).

---

## Cattle Types

Defined in `src/utils/constants.js`:

| Value | English | Hindi |
|---|---|---|
| `cow` | Cow | गाय |
| `buffalo` | Buffalo | भैंस |
| `goat` | Goat | बकरी |
| `camel` | Camel | ऊंट |

`CATTLE_OPTIONS` array carries both labels for use in dropdowns without i18n coupling.

---

## Routing Reference

| Path | Component | Guard |
|---|---|---|
| `/` | Landing | PublicRoute |
| `/login` | Login | PublicRoute |
| `/role-select` | RoleSelect | PrivateRoute (no role check) |
| `/onboarding` | Onboarding | PrivateRoute (no role check) |
| `/seller` | SellerDashboard | PrivateRoute role=seller |
| `/seller/buyers` | BuyerList | PrivateRoute role=seller |
| `/seller/buyers/add` | AddEditBuyer | PrivateRoute role=seller |
| `/seller/buyers/:id` | BuyerDetail | PrivateRoute role=seller |
| `/seller/entry` | DailyEntry | PrivateRoute role=seller |
| `/seller/settings` | SellerSettings | PrivateRoute role=seller |
| `/buyer` | BuyerDashboard | PrivateRoute role=buyer |
| `/buyer/records` | MyRecords | PrivateRoute role=buyer |
| `/buyer/nearby` | NearbySellers | PrivateRoute role=buyer |
| `/buyer/profile` | BuyerProfile | PrivateRoute role=buyer |
| `/buyer/link` | LinkRequest | PrivateRoute role=buyer |

`PrivateRoute` redirect chain: not authed → `/login`; no role → `/role-select`; no name → `/onboarding`; wrong role → correct dashboard.

---

## Environment Variables

All Firebase config via `VITE_FIREBASE_*` in `.env`:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

---

## Firestore Security Rules Summary

- `users`, `sellers` — any auth user can **read** (needed for nearby-seller discovery); only owner can write
- `sellerBuyers/{sellerId}/members/{buyerId}` — seller reads/writes; buyer reads their own member doc
- `sellerPrices` — any auth reads; only seller writes
- `records/{sellerId}/entries` — seller writes; buyer reads where `resource.data.buyerId == request.auth.uid`
- `buyerSelfRecords/{buyerId}` — buyer only
- `payments/{sellerId}/transactions` — seller writes; buyer reads own payment records
- `buyers/{buyerId}` — buyer reads/writes own doc
- `linkRequests` — buyer creates; seller reads/updates
