"use client";

import { useEffect, useState } from "react";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { COLLECTIONS, getDocumentData } from "@/app/lib/firebase/firestore";

type UserDoc = { name?: string };

/**
 * Canonical name + email for account UI (matches Home dashboard: Firestore users.name first).
 */
export function useAuthAccountProfile(): { displayName: string; email: string } {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) {
        if (!cancelled) {
          setDisplayName("");
          setEmail("");
        }
        return;
      }
      if (!cancelled) setEmail(user.email ?? "");
      const { data } = await getDocumentData<UserDoc>(COLLECTIONS.users, user.uid);
      if (cancelled) return;
      const fromDoc = data?.name?.trim();
      const fromAuth = user.displayName?.trim();
      setDisplayName(fromDoc || fromAuth || "");
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { displayName, email };
}
