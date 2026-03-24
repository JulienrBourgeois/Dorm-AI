/**
 * Admin auth helpers: user upsert, admin access check, session sync, error messages.
 * Client-only; used by the admin login funnel after Firebase Auth completes.
 */
import type { User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase/app";
import {
  setDocument,
  getDocumentData,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";

/**
 * Create or update the user document after auth.
 * On first sign-up, creates the document and an ADMIN membership for the admin signup flow.
 * On subsequent logins, merges fresh info.
 * @returns { created: true } when the user doc was created (new signup), { created: false } when updated.
 */
export async function upsertUserDoc(user: User): Promise<{ created: boolean }> {
  const { exists } = await getDocumentData(COLLECTIONS.users, user.uid);
  const now = dateToTimestamp(new Date());

  if (!exists) {
    await setDocument(COLLECTIONS.users, user.uid, {
      name: user.displayName ?? "",
      email: user.email ?? "",
      createdAt: now,
      updatedAt: now,
    });
    await setDocument(COLLECTIONS.memberships, `${user.uid}-admin`, {
      userId: user.uid,
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    });
    return { created: true };
  }

  await setDocument(
    COLLECTIONS.users,
    user.uid,
    {
      email: user.email ?? "",
      updatedAt: now,
    },
    { merge: true }
  );
  return { created: false };
}

/**
 * Check if the user has an active ADMIN membership.
 * Queries the memberships collection for userId + role ADMIN + status ACTIVE.
 */
export async function checkAdminAccess(userId: string): Promise<boolean> {
  const q = query(
    collection(db, COLLECTIONS.memberships),
    where("userId", "==", userId),
    where("role", "==", "ADMIN"),
    where("status", "==", "ACTIVE")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Sync Firebase Auth state to the server-managed `__session` cookie.
 * Uses the same API route used by SessionCookieSync.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error("Unable to create session cookie");
  }
}

/**
 * Clears the server-managed `__session` cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clear: true }),
    credentials: "same-origin",
  });
}

const ERROR_MAP: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
};

/** Map Firebase error codes to user-friendly messages. */
export function getAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? (error as { code: string }).code
      : "";
  return (
    ERROR_MAP[code] ??
    (error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.")
  );
}
