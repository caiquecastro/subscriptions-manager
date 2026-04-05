# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run test         # Run tests (vitest)
npm run check        # Lint and format check (Biome)
npm run check:fix    # Auto-fix lint/format issues
```

Run a single test file:
```bash
npx vitest run src/lib/subscriptions.test.ts
```

## Architecture

**Vault** is a personal subscription and balance tracker built with TanStack Start (SSR-capable React framework), TanStack Router (file-based routing), TanStack Query (server state), and Firebase.

### Data flow

- Firebase Firestore is the source of truth. All reads/writes go through `src/lib/firebase.ts`.
- Data is user-scoped: `users/{uid}/subscriptions`, `users/{uid}/balances`, `users/{uid}/invoices`.
- TanStack Query wraps all Firestore calls. Query options are defined in `src/lib/query.ts` and used directly in route components via `useSuspenseQuery`.
- Auth state lives in `AuthProvider` (`src/lib/auth.tsx`). The `useAuth()` hook gives access to `user`, `status`, and `signInWithGoogle`. Auth gates the entire app in `__root.tsx`.

### Routing

Routes live in `src/routes/`. TanStack Router generates `src/routeTree.gen.ts` automatically — do not edit it manually. The root route (`__root.tsx`) handles auth gating and the shell layout (Sidebar + TopBar + main content area).

### Forms

Forms use TanStack Form. The reusable form primitives (`FormField`, `BalanceForm`, `SubscriptionForm`) live in `src/components/`. Field inputs and labels are extracted as shared components.

### Styling

Tailwind CSS v4 with `@tailwindcss/vite`. Use `cn()` from `src/lib/cn.ts` (wraps `clsx` + `tailwind-merge`) for conditional class merging. Material Symbols icon font is used for icons.

### Linting

Biome handles both linting and formatting. Double quotes, 2-space indent, trailing commas (ES5). `src/routeTree.gen.ts` is excluded from linting.

### Path aliases

`#/*` maps to `src/*` (configured in `package.json` `imports` field and `tsconfig.json`).
