# MilkBook — *Apna dudh, apna hisaab*

A modern, responsive Progressive Web Application (PWA) designed for dairy sellers and buyers to log milk deliveries, track payment records, and maintain billing transparency.

---

## Key Features

1. **Shared Peer-to-Peer Ledgers**: Anyone (buyer or seller) can create a **MilkBook** ledger. If the partner's phone is added, the book is automatically linked to their profile, granting them read-only view access.
2. **Geohash Spatial Queries**: Discover nearby sellers on a Leaflet map. Geolocation queries are optimized using bounding-box geohashes (`geofire-common`) to filter coordinates in Firestore efficiently without downloading the whole database.
3. **Bilingual Support (i18n)**: Fully translated interfaces in English and Hindi, stored client-side and persistent.
4. **Offline GPS Fallback**: Seamless fallback to IP-based Geolocation and manual Noida/Delhi coordinate overrides when system GPS permissions are disabled.
5. **PDF Receipts & Downloads**: Generate and download monthly billing statements complete with animal-type breakdowns, total deliveries breakdown, and daily comments.

---

## User Flows

### Seller / Buyer role-specific discovery flow
1. **Login** (`/login`) — OTP via Firebase Phone Auth.
2. **Role select** (`/role-select`) — writes `role: 'seller' | 'buyer'` to `users/{uid}`.
3. **Onboarding** (`/onboarding`) — sets profile `name` and `about`. For sellers who want to sell milk and be searchable by nearby buyers, providing a GPS location is **mandatory** (saves `gpsLocation` and `geohash` coordinates).
4. **Nearby sellers** (`/buyer/nearby`) — To view nearby sellers on the Leaflet map, the user **must** share their current location (either natively or via test fallback) to calculate the search center and query matching sellers within a 10km radius.

### MilkBook Shared Ledger flow
1. **Starting a MilkBook** — The creator inputs the partner's name, phone, starting date, quantities, and cattle pricing.
2. **Auto-Linking** — If the partner registers with that phone number, the book is automatically linked to their account.
3. **Daily Entries** — The creator logs morning/evening milk quantities.
4. **Billing & Payments** — The creator records payments. Balance dues and transaction logs are synced automatically in real-time.
5. **Viewer access** — The partner views the ledger on their dashboard under *"Shared Books"* in read-only mode.

---

## Technical Stack & Architecture

- **Frontend**: React, React Router DOM, Tailwind CSS (v4), Lucide React.
- **Backend & DB**: Firebase Auth & Cloud Firestore.
- **Mapping**: Leaflet, React-Leaflet, OpenStreetMap.
- **Geohashing**: `geofire-common` library.
- **Localization**: `react-i18next`.

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Compile production bundle (dist/)
npm run build

# Preview the compiled production build
npm run preview
```