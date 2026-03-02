# Firebase Auth (app/lib/firebase)

This project uses Firebase Authentication from **client-side code only**. The layer lives under `app/lib/firebase`: a singleton Firebase app plus a modular `auth` folder with thin wrappers around the Firebase Auth SDK.

## Location and usage

- **`app/lib/firebase/app.ts`** — Firebase app singleton and `auth` instance. Do not import in Server Components.
- **`app/lib/firebase/auth/`** — Email/password, password reset, email verification, phone (SMS code), and auth state. Import from `@/app/lib/firebase/auth` in **Client Components** or client-side hooks.

## Environment variables

All Firebase config is read from `NEXT_PUBLIC_*` so the client can initialize the SDK. Set these in `.env.local` (and in Vercel for production):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Project auth domain (e.g. `projectId.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

See [Environment variables](environment-variables.md) for where to put them and [Firebase: Add Firebase to your app](https://firebase.google.com/docs/web/setup#add-sdk-and-initialize) for where to copy values from the console.

## Auth modules

| Module | Exports | Use for |
|--------|--------|--------|
| **emailPassword** | `signUp`, `signIn`, `signOutUser` | Create account, sign in, sign out with email/password. |
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

## Official docs

- [Firebase Auth: Get started (web)](https://firebase.google.com/docs/auth/web/start)
- [Password auth](https://firebase.google.com/docs/auth/web/password-auth)
- [Phone auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Manage users](https://firebase.google.com/docs/auth/web/manage-users) (reset password, email verification, etc.)
