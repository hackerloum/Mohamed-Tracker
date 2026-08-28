# Mohamed — Personal Life OS

Private, owner-only PWA. Wave A is the scaffold: sign-in, owner gate, Atelier UI, routes, typed data layer, Firestore rules, Serwist. Habits and money logging are not live yet.

## Stack

Next.js App Router, TypeScript strict, Tailwind v4, Firebase (Auth / Firestore / Storage / Messaging stubs), Serwist, Vitest.

## Setup

1. Copy env and fill **your** Firebase web config (the committed `.env.local` is placeholders so the app can boot):

```bash
cp .env.example .env.local
```

On Windows PowerShell: `Copy-Item .env.example .env.local`

2. Enable **Google** as an Auth provider in the Firebase console.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users land on `/sign-in`.

4. Sign in once, copy your Google account **UID** from Firebase Auth (or Account settings after an unauthorized screen).

5. Set the owner claim (Admin SDK service account in `.env.local`):

```bash
npm run set-owner -- <UID>
```

Then sign out and back in so the ID token refreshes. Firestore rules require `request.auth.token.owner == true` and `request.auth.uid == userId`.

6. Optional seed (habits, categories, payment methods, quiet hours 23:00–06:00):

```bash
npm run seed -- <UID>
```

`scripts/seed.ts` is never imported by the UI.

## Env vars

**Client (safe in the web app, still not a substitute for rules):**

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (Wave G web push)

**Scripts only — never expose to the browser:**

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `OWNER_UID` (optional default for the scripts)

`.env.local` is gitignored.

## Deploy

- **Vercel:** import this repo, set the `NEXT_PUBLIC_FIREBASE_*` variables, deploy. PWA / Serwist service worker is produced on `npm run build` (webpack, required by `@serwist/next`).
- **Firebase:** `firebase deploy --only firestore:rules,firestore:indexes,storage` after `firebase use` on your project. Cloud Functions / FCM sending is Wave G.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server (SW disabled) |
| `npm run build` | Production build + Serwist worker |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (date + TZS helpers) |
| `npm run set-owner` | `{ owner: true }` custom claim |
| `npm run seed` | Default habits / categories / payment methods |

## Notes

- Dates: `YYYY-MM-DD` via `src/core/dates`, default timezone `Africa/Dar_es_Salaam`.
- Money: integer TZS only (`src/core/money`).
- Components do not call Firestore; repositories do.
- iPhone: Add to Home Screen for standalone. Do not prompt for push on first paint.
