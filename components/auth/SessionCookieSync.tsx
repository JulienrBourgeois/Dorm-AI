"use client";

import { useEffect } from "react";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { ensureFirestoreUserForSession } from "@/lib/auth/ensureFirestoreUserForSession";

/**
 * Keeps the __session cookie in sync with Firebase Auth so middleware can
 * redirect without showing any UI. Run once in root layout.
 * If `users/{uid}` cannot be read or created in this environment's Firestore, signs out.
 */
export function SessionCookieSync() {
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        const ok = await ensureFirestoreUserForSession(user);
        if (!ok) {
          return;
        }
        try {
          const token = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            credentials: "same-origin",
          });
        } catch {
          // ignore
        }
      } else {
        try {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clear: true }),
            credentials: "same-origin",
          });
        } catch {
          // ignore
        }
      }
    });
    return unsubscribe;
  }, []);

  return null;
}
