# Vault

Vault is a small personal dashboard for tracking recurring subscriptions and stored balances in one place. It combines subscription renewals, digital credits, and lightweight spending insights in a single React app backed by Firebase Firestore.

## What the project does

- Tracks recurring subscriptions with category, billing cycle, renewal date, status, notes, and icon metadata
- Tracks balances such as gift cards, store credit, ride credits, and reward points
- Shows a dashboard with portfolio totals, monthly recurring cost, upcoming renewals, and quick insights
- Includes dedicated views for subscriptions, balances, analytics, and adding new entries
- Reads and writes data from Firebase Firestore for subscriptions and balances

## Tech stack

- React 19
- TanStack Start
- TanStack Router with file-based routes
- Vite
- Tailwind CSS v4
- Firebase Firestore

## Project structure

```text
src/
  components/
    Sidebar.tsx
    TopBar.tsx
  lib/
    firebase.ts
  routes/
    __root.tsx
    index.tsx
    subscriptions.tsx
    balances.tsx
    analytics.tsx
    add.tsx
```

## Main screens

### Dashboard

The home screen aggregates the current tracked data and highlights:

- total balance across stored-value accounts
- normalized monthly subscription spend
- upcoming renewals
- recent subscription entries
- static savings insight cards

### Subscriptions

The subscriptions page includes:

- category filters
- sorting by renewal date, price, or name
- urgent renewal warnings
- a high-cost alert when one subscription dominates monthly spend

### Balances

The balances page includes:

- total estimated balance
- reward points summary
- expiring credit alerts
- a visual placeholder trend chart

### Analytics

The analytics page includes:

- monthly and yearly spend summaries
- category spend breakdown
- top expenses
- a simple monthly trend visualization

### Add Entry

The add page supports creating either:

- a subscription
- a balance

Subscriptions and balances are persisted through Firestore via the helpers in [src/lib/firebase.ts](/Users/caique.silva/Code/Personal/subscriptions-manager/src/lib/firebase.ts).

## Data model

### Subscription

- `name`
- `category`
- `cost`
- `billingCycle`: `monthly | yearly | quarterly`
- `nextRenewal`
- `status`: `active | paused | cancelled`
- `icon`
- `notes`
- `createdAt`

### Balance

- `name`
- `type`
- `amount`
- `expiresAt`
- `icon`
- `notes`
- `createdAt`

## Running locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Firebase setup

This app uses Firebase Firestore for data persistence. You need to set up a Firebase project and provision a Firestore database.

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
2. Create a local `.env` file in the project root with these values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

3. Log in to Firebase CLI:

```bash
npx firebase-tools login
```

4. Create the Firestore database:

```bash
npx firebase-tools firestore:databases:create "(default)" --project <your-project-id> --location=us-east1
```

5. Deploy security rules:

```bash
npx firebase-tools deploy --only firestore:rules --project <your-project-id>
```

Replace `<your-project-id>` with the value used in `VITE_FIREBASE_PROJECT_ID`.

If Firebase is not configured correctly, Firestore reads and writes will fail until the project configuration and rules are set correctly.

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
```

## Build and test

Create a production build:

```bash
npm run build
```

Run the test suite:

```bash
npm run test
```

## Notes

- Firestore rules live in [firestore.rules](/Users/caique.silva/Code/Personal/subscriptions-manager/firestore.rules).
- Firebase hosting configuration lives in [firebase.json](/Users/caique.silva/Code/Personal/subscriptions-manager/firebase.json).
- The current UI uses generated placeholder visuals in a few places, such as the balance and monthly trend charts.
