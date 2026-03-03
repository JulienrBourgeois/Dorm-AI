# Environment variables — Next.js and Vercel

This doc explains how environment variables work in this Next.js project: locally (development) and when deployed on **Vercel**. For full details, see the [Next.js Environment Variables docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) and [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables).

## Overview

Environment variables let you keep secrets (API keys, DB URLs) and config (feature flags, API base URLs) out of your code. Next.js loads them at **build time** and optionally at **runtime** on the server.

## Two kinds of variables in Next.js

| Prefix | Exposed to browser? | Use for |
|--------|---------------------|--------|
| **No prefix** (e.g. `DATABASE_URL`) | No — server only | Secrets: API keys, DB URLs, private tokens. Safe for Server Components and API routes. |
| **`NEXT_PUBLIC_`** (e.g. `NEXT_PUBLIC_API_URL`) | Yes — inlined into client JS | Public config: public API base URL, analytics ID, feature flags that the client needs. |

**Rule:** Never put real secrets in `NEXT_PUBLIC_*` — anything with that prefix is visible in the browser.

## Local development

### Where to put variables

Next.js reads env files in this order (later overrides earlier):

| File | When it’s loaded | Typical use |
|------|------------------|-------------|
| `.env` | All environments | Defaults shared by everyone (e.g. `NEXT_PUBLIC_APP_NAME=Dorm AI`). |
| `.env.local` | All environments, **not committed** | Local overrides and secrets. Add to `.gitignore`. |
| `.env.development` | `next dev` only | Dev-only defaults. |
| `.env.development.local` | `next dev` only, **not committed** | Your personal dev secrets. |

**Recommended:** Commit `.env.example` (no real values) so the team knows which variables exist. Each developer copies it to `.env.local` and fills in values.

### Example `.env.local` (do not commit)

```bash
# Server-only (never use NEXT_PUBLIC_ for secrets)
DATABASE_URL=postgresql://user:pass@localhost:5432/dorm
API_SECRET_KEY=your-secret-key

# Public (inlined into client bundle)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Firebase (client)

The Firebase Auth layer in `app/lib/firebase` needs these **public** variables (see [Firebase Auth](firebase-auth.md) for usage):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Storage bucket names are fixed in code: `dorm-ai.firebasestorage.app` (prod) and `dorm-ai-sandbox` (sandbox); see `STORAGE_BUCKET_PROD` and `STORAGE_BUCKET_SANDBOX` in `app/lib/env.ts`.

### Sandbox vs production (Firebase)

The app uses **environment code** in `app/lib/env.ts` to decide sandbox vs production. When **sandbox** is active:

- **Firestore** uses a separate database with ID `sandbox` (production uses the default database). See [Firestore](firestore.md).
- **Storage** uses fixed bucket names: `dorm-ai-sandbox` (sandbox) and `dorm-ai.firebasestorage.app` (prod); see `STORAGE_BUCKET_SANDBOX` and `STORAGE_BUCKET_PROD` in `app/lib/env.ts`. The active bucket is returned by `getStorageBucketName()`.

| Variable | Purpose |
|---------|---------|
| `NEXT_PUBLIC_FIREBASE_USE_SANDBOX` | Optional override: `"true"` or `"false"`. If set, overrides the automatic heuristic. Leave unset to use heuristic. |

**Heuristic when `NEXT_PUBLIC_FIREBASE_USE_SANDBOX` is unset:** sandbox mode is true for **Vercel Preview** (`NEXT_PUBLIC_VERCEL_ENV` or `VERCEL_ENV === 'preview'`) and **local development** (`NODE_ENV === 'development'`). For debugging, call `getEnvironmentDebug()` or `logEnvironmentDebug()` (no secrets logged); they include `storageBucketName` and `firestoreDatabaseId`.

### Using variables in code

- **Server Components / Route Handlers / Server Actions:** Use `process.env.MY_VAR` or `process.env.NEXT_PUBLIC_MY_VAR`. Both work; only `NEXT_PUBLIC_*` is also available on the client.
- **Client Components:** Only `process.env.NEXT_PUBLIC_*` is available. Access at build time; no server-only vars.

```tsx
// Server Component or API route — can use any env var
const dbUrl = process.env.DATABASE_URL;
const publicUrl = process.env.NEXT_PUBLIC_API_URL;

// Client Component — only NEXT_PUBLIC_* is defined
"use client";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Loading and restart

- Env files are loaded when the dev server **starts**. If you change `.env` or `.env.local`, restart with `npm run dev` (or `yarn dev` / `pnpm dev`).

## Vercel (production and preview)

### Where to set variables

1. **Vercel Dashboard:** Project → **Settings** → **Environment Variables**. Add name/value and choose **Production**, **Preview**, and/or **Development**.
2. **Vercel CLI:** `vercel env add MY_VAR` (prompts for value and environment).

Variables you set in the dashboard (or via CLI) are available at **build time** by default. For runtime-only variables, use **Vercel’s “Runtime” option** (see Vercel docs).

### Environments in Vercel

| Vercel environment | When it’s used |
|--------------------|----------------|
| **Production** | Deploys from the production branch (e.g. `main`). |
| **Preview** | Every other branch/PR and deploy. Use for staging URLs, test API keys. |
| **Development** | `vercel dev` when running locally with Vercel’s dev server. |

You can give the same variable different values per environment (e.g. different `DATABASE_URL` for Production vs Preview).

### Build vs runtime

- **Build time:** Variables are baked in when Vercel runs `next build`. Changing a variable in the dashboard requires a **redeploy** to take effect.
- **Runtime:** If you need a variable to change without redeploying, use Vercel’s runtime env support and read it only in server code (e.g. Route Handlers, Server Actions).

### What gets committed

- **Do not** commit `.env.local`, `.env.development.local`, or any file with real secrets.
- **Do** commit `.env.example` (with placeholder names and fake values) so the team and Vercel setup know which variables to configure.

## Checklist

- [ ] Use `NEXT_PUBLIC_` only for non-secret, client-needed config.
- [ ] Keep secrets in unprefixed vars; use them only in server code.
- [ ] Add `.env.local` (and `*.local`) to `.gitignore`.
- [ ] Provide `.env.example` and document each variable.
- [ ] On Vercel, set Production/Preview (and optionally Development) variables in Project Settings.
- [ ] Redeploy after changing build-time env vars on Vercel.

## Learn more

- [Next.js: Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js: Loading .env files](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#loading-environment-variables)
- [Vercel: Environment Variables](https://vercel.com/docs/projects/environment-variables)
