# Firebase Auth (app/lib/firebase)

This project uses Firebase Authentication from **client-side code only**. The layer lives under `app/lib/firebase`: a singleton Firebase app plus a modular `auth` folder with thin wrappers around the Firebase Auth SDK.

## Location and usage

- **`app/lib/firebase/app.ts`** — Firebase app singleton and `auth` instance. Do not import in Server Components.
- **`app/lib/firebase/auth/`** — Email/password, password reset, email verification, phone (SMS code), delete account, and auth state. Import from `@/app/lib/firebase/auth` in **Client Components** or client-side hooks.

## Environment variables

All Firebase config is read from `NEXT_PUBLIC_*` so the client can initialize the SDK. Set these in `.env.local` (and in Vercel for production):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Project auth domain (e.g. `projectId.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

Storage bucket is chosen in code by environment (sandbox vs prod); see [Environment variables](environment-variables.md).

See [Environment variables](environment-variables.md) for where to put them and [Firebase: Add Firebase to your app](https://firebase.google.com/docs/web/setup#add-sdk-and-initialize) for where to copy values from the console.

## Auth modules

| Module | Exports | Use for |
|--------|--------|--------|
| **emailPassword** | `signUp`, `signIn`, `signOutUser` | Create account, sign in, sign out with email/password. |
| **deleteAccount** | `deleteAccount`, `reauthenticateWithEmail` | Delete the current user (and sign out). If Firebase requires recent login, call `reauthenticateWithEmail(email, password)` then retry `deleteAccount()`. |
| **passwordReset** | `sendPasswordReset` | Send password reset email to an address. |
| **emailVerification** | `sendVerificationEmail` | Send verification email for the current user. |
| **phone** | `createRecaptchaVerifier`, `sendPhoneCode`, `confirmPhoneCode` | SMS code flow: create reCAPTCHA, send code, confirm with user-entered code. Requires a DOM element for reCAPTCHA. |
| **state** | `subscribeToAuthState` | Subscribe to auth state changes (e.g. for a `useAuth` hook). Returns an unsubscribe function. |

## Example: sign in from a Client Component

```tsx
"use client";

import { signIn } from "@/app/lib/firebase/auth";

export function SignInForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      await signIn(email, password);
      // redirect or update UI
    } catch (err) {
      // handle error (e.g. auth/invalid-credential)
    }
  }
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Example: subscribe to auth state

```tsx
"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setUser);
    return unsubscribe;
  }, []);
  return user;
}
```

## Example: delete account

```tsx
"use client";

import { deleteAccount, reauthenticateWithEmail } from "@/app/lib/firebase/auth";

// Simple delete (may throw auth/requires-recent-login)
await deleteAccount();

// If reauth required: reauthenticate then delete
await reauthenticateWithEmail(user.email ?? "", password);
await deleteAccount();
```

## Admin login funnel (`/admin/login`)

A production-ready auth funnel at `/admin/login` for admin users. The funnel is a step-based single-page flow supporting **email/password** and **phone OTP**.

### Files

Only the route and page components live under `app/admin/login`; shared admin code lives at the **project root**:

| File | Purpose |
|------|---------|
| `app/admin/login/page.tsx` | Route entry point (Server Component with metadata). |
| `app/admin/login/AdminAuthFunnel.tsx` | Client Component: orchestrator that renders the current step (imports hook + step components from root). |
| `hooks/admin/useAuthFunnel.ts` | Hook: all auth state, handlers, post-auth flow. |
| `lib/admin/adminAuth.ts` | Helpers: `upsertUserDoc`, `checkAdminAccess`, `setAuthCookie`/`clearAuthCookie`, `getAuthErrorMessage`. |
| `types/admin/authFunnel.ts` | Types: `AuthStep`, `AuthFunnelState`, `AuthFunnelActions`. |
| `components/admin/ui.tsx` | Shared UI: Shell, AnimateStep (cascaded slide-up), buttons, inputs, icons. |
| `components/admin/steps/*.tsx` | Step screens: WelcomeSteps, EmailSteps, PhoneSteps, ResetSteps, StatusSteps. |
| `app/styles/animations/slide-up.css` | Step and page slide-up animations; cascaded stagger so content animates top-to-bottom. |
| `middleware.ts` | Protects `/admin/*` (except `/admin/login`). Redirects to login when `admin-session` cookie is missing. |

### UI and animations

The funnel uses cascaded slide-up animations: each step’s content (logo, title, copy, buttons) animates in from top to bottom with a 0.1s stagger. The page wrapper slides up on initial load. Animation definitions live in **`app/styles/animations/slide-up.css`**; `AnimateStep` in `components/admin/ui.tsx` applies the cascade to every step. See [Styling: colors and animations](styling-colors.md#animations).

### Flow

1. **Welcome** — Choose "Sign up with email" or "Sign up with phone". Links to "Log in" for returning users.
2. **Login chooser** — "Continue with email" or "Continue with phone". Links to "Create account".
3. **Email sign up** — Email, password, confirm password. Creates account via `signUp()`.
4. **Email login** — Email, password. Signs in via `signIn()`. Links to "Forgot password?".
5. **Phone entry** — Phone number input. Sends OTP via `sendPhoneCode()` (invisible reCAPTCHA).
6. **Phone OTP** — 6-digit code input with 60-second resend cooldown.
7. **Forgot password** — Email input, sends reset link via `sendPasswordReset()`.
8. **Reset sent** — Confirmation with "Back to log in".
9. **Post-auth** — Upserts user doc, queries `memberships` for `role: "ADMIN"` + `status: "ACTIVE"`. If admin: sets session cookie, redirects to `/admin`. If not: shows "Access denied" with sign-out.

### Admin access

Anyone can sign up, but only users with an **active ADMIN membership** in Firestore can access `/admin` routes. Membership records must be created separately (e.g. by another admin or manually in the Firebase Console). The membership query checks:
- `userId == currentUser.uid`
- `role == "ADMIN"`
- `status == "ACTIVE"`

### Route protection

- **Middleware** (`middleware.ts`): lightweight cookie-presence check on `/admin/*` (except `/admin/login`). Redirects unauthenticated visitors to login.
- **Client-side guard** (`AdminAuthFunnel.tsx`): after auth, verifies Firebase Auth state and admin membership. Sets/clears `admin-session` cookie.

## Official docs

- [Firebase Auth: Get started (web)](https://firebase.google.com/docs/auth/web/start)
- [Password auth](https://firebase.google.com/docs/auth/web/password-auth)
- [Phone auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Manage users](https://firebase.google.com/docs/auth/web/manage-users) (reset password, email verification, delete a user, etc.)
