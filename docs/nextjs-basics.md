# Next.js basics — team reference

This project uses **Next.js** with the **App Router**. This doc is a short reference for how the app is structured and where to put things. For full details, see the [Next.js docs](https://nextjs.org/docs).

## App Router and the `app/` folder

Next.js uses **file-based routing**: the folders and files inside `app/` define the URLs.

| File | Purpose |
|------|--------|
| `app/layout.tsx` | Root layout: wraps every page (e.g. shared header, fonts, `<html>`). |
| `app/page.tsx` | The **home page** at `/`. |
| `app/globals.css` | Global styles (Tailwind, CSS variables). |
| `app/some-page/page.tsx` | Page at `/some-page`. |
| `app/admin/layout.tsx` | Layout only for routes under `/admin`. |
| `app/admin/page.tsx` | Page at `/admin`. |
| `app/admin/rooms/page.tsx` | Page at `/admin/rooms`. |

**Rules:**

- A **folder** with a `page.tsx` becomes a route. The folder name is the URL segment.
- A **layout.tsx** in a folder wraps all pages under that folder (including nested ones).
- Special names: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` — others are not routes.

## Server vs Client components

By default, components in the App Router are **Server Components**: they run on the server only. That’s good for fetching data, using secrets, and keeping the JS bundle small.

- **Server Component** (default): No `"use client"`. Can use `async` and fetch data directly. No browser APIs or hooks like `useState`.
- **Client Component**: Add `"use client"` at the top. Use `useState`, `useEffect`, event handlers, browser APIs. Use when you need interactivity.

Put Client Components only where you need them (e.g. a form or a dropdown); keep the rest as Server Components.

## Navigation and links

Use the Next.js **Link** component so navigation is client-side and fast:

```tsx
import Link from "next/link";

<Link href="/admin">Admin</Link>
<Link href="/admin/rooms">Rooms</Link>
```

Use `<a>` only for external URLs. For internal routes, prefer `Link`.

## Where to put things

| Place | Use for |
|-------|--------|
| `app/` | Routes: one folder per segment, with `page.tsx` and optional `layout.tsx`. |
| `app/(group)/` | Route groups: organize routes without changing the URL (e.g. `(auth)` for login/signup). |
| `lib/` | Shared code: helpers, Server Actions, auth, DB client (e.g. Prisma). Not tied to a single route. |
| `components/` | Reusable UI components (optional; some projects keep them under `app/` or `lib/`). |
| `public/` | Static files: images, favicon. Reference as `/filename` (e.g. `/logo.png`). |

This repo uses **Tailwind** for styling; class names go on JSX elements. Global styles and theme variables live in `app/globals.css`.

## Running the app

- **Development**: `npm run dev` — dev server with hot reload at [http://localhost:3000](http://localhost:3000).
- **Production build**: `npm run build` then `npm start`. Always run `npm run build` before pushing; see [Git basics](git-basics.md).

## Learn more

- [Next.js App Router](https://nextjs.org/docs/app)
- [Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
