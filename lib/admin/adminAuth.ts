/**
 * Admin auth helpers: user upsert, admin access check, session cookie, error messages.
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
      phone: user.phoneNumber ?? "",
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
      phone: user.phoneNumber ?? "",
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

export function setAuthCookie(token: string) {
  document.cookie = `admin-session=${token}; path=/; max-age=3600; SameSite=Strict`;
}

export function clearAuthCookie() {
  document.cookie = "admin-session=; path=/; max-age=0; SameSite=Strict";
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
  "auth/invalid-phone-number": "Please enter a valid phone number (e.g. +1234567890).",
  "auth/invalid-verification-code": "Invalid verification code. Please try again.",
  "auth/code-expired": "Verification code expired. Please request a new one.",
  "auth/missing-phone-number": "Please enter a phone number.",
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
