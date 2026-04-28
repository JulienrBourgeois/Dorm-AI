"use client";

import { useEffect, useState } from "react";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { COLLECTIONS, getDocumentData } from "@/app/lib/firebase/firestore";
import { getDownloadUrl } from "@/app/lib/firebase/storage";

type UserDoc = { name?: string; profilePhotoPath?: string };

/**
 * Canonical name + email for account UI (matches Home dashboard: Firestore users.name first).
 */
export function useAuthAccountProfile(): { displayName: string; email: string; photoUrl: string } {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) {
        if (!cancelled) {
          setDisplayName("");
          setEmail("");
          setPhotoUrl("");
        }
        return;
      }
<<<<<<< HEAD
      try {
        if (!cancelled) setEmail(user.email ?? "");
        const { data } = await getDocumentData<UserDoc>(COLLECTIONS.users, user.uid);
        if (cancelled) return;
        const fromDoc = data?.name?.trim();
        const fromAuth = user.displayName?.trim();
        setDisplayName(fromDoc || fromAuth || "");
        const photoPath = data?.profilePhotoPath?.trim();
        if (!photoPath) {
          if (!cancelled) setPhotoUrl("");
          return;
        }
        try {
          const url = await getDownloadUrl(photoPath);
          if (!cancelled) setPhotoUrl(url);
        } catch {
          if (!cancelled) setPhotoUrl("");
        }
      } catch {
        // Ignore transient auth-transition read failures during logout.
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { displayName, email, photoUrl };
}
