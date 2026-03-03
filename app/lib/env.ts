/**
 * Environment flags and sandbox/prod helpers. Safe for client and server.
 * Do not import from Firebase here (avoids circular dependency).
 */

const hasProcess = typeof process !== "undefined";

export const isVercelPreview =
  hasProcess &&
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "preview");

export const isVercelProduction =
  hasProcess &&
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "production");

export const isLocalDev = hasProcess && process.env.NODE_ENV === "development";

const sandboxFromEnv =
  hasProcess && process.env.NEXT_PUBLIC_FIREBASE_USE_SANDBOX !== undefined
    ? process.env.NEXT_PUBLIC_FIREBASE_USE_SANDBOX === "true"
    : null;

/** Use sandbox/test mode: from NEXT_PUBLIC_FIREBASE_USE_SANDBOX if set, else preview or local dev. */
export const useSandbox =
  typeof sandboxFromEnv === "boolean"
    ? sandboxFromEnv
    : isVercelPreview || isLocalDev;

/**
 * Safe environment summary for server-side logging (no secrets).
 */
/** Firestore database ID for sandbox; production uses the default database. */
export const FIRESTORE_DATABASE_ID_SANDBOX = "sandbox";

/** Storage bucket name when useSandbox is true. */
export const STORAGE_BUCKET_SANDBOX = "dorm-ai-sandbox";

/** Storage bucket name for production. */
export const STORAGE_BUCKET_PROD = "dorm-ai.firebasestorage.app";

/** Return the Firestore database ID for the current environment (sandbox or default). */
export function getFirestoreDatabaseId(): string {
  return useSandbox ? FIRESTORE_DATABASE_ID_SANDBOX : "(default)";
}

export function getEnvironmentDebug(): {
  NODE_ENV: string;
  VERCEL_ENV: string | undefined;
  isLocalDev: boolean;
  isVercelProduction: boolean;
  isVercelPreview: boolean;
  useSandbox: boolean;
  useFirestoreSandbox: boolean;
  storageBucketName: string;
  firestoreDatabaseId: string;
  hasFirebaseProjectId: boolean;
  hasFirebasePrivateKey: boolean;
} {
  return {
    NODE_ENV: hasProcess ? process.env.NODE_ENV ?? "undefined" : "n/a",
    VERCEL_ENV: hasProcess
      ? process.env.NEXT_PUBLIC_VERCEL_ENV ??
        process.env.VERCEL_ENV ??
        undefined
      : undefined,
    isLocalDev,
    isVercelProduction,
    isVercelPreview,
    useSandbox,
    useFirestoreSandbox,
    storageBucketName: getStorageBucketName(),
    firestoreDatabaseId: getFirestoreDatabaseId(),
    hasFirebaseProjectId: hasProcess && !!process.env.FIREBASE_PROJECT_ID,
    hasFirebasePrivateKey:
      hasProcess && !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  };
}

/** Log environment summary to console (safe, no secrets). */
export function logEnvironmentDebug(label = "Environment") {
  if (typeof console === "undefined") return;
  console.info(`[${label}]`, JSON.stringify(getEnvironmentDebug(), null, 2));
}

const stripeSandboxOverride: boolean | undefined = undefined;
const firestoreSandboxOverride: boolean | undefined = undefined;

export const useStripeSandbox =
  typeof stripeSandboxOverride === "boolean"
    ? stripeSandboxOverride
    : useSandbox;

export const useFirestoreSandbox =
  typeof firestoreSandboxOverride === "boolean"
    ? firestoreSandboxOverride
    : useSandbox;

/** Return the Storage bucket name for the current environment (sandbox or prod). */
export function getStorageBucketName(): string {
  return useSandbox ? STORAGE_BUCKET_SANDBOX : STORAGE_BUCKET_PROD;
}

export function getBaseUrl(): string {
  if (isLocalDev) return "http://localhost:3000";
  if (isVercelPreview && hasProcess && process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (isVercelProduction && hasProcess && process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (typeof window === "undefined" && hasProcess) {
    const url = process.env.VERCEL_URL || process.env.HOST;
    if (url) return `https://${url}`;
  }
  return "";
}

/** Current Firestore view mode (server: env-based; client: localStorage override or env). */
export function getFirestoreViewMode(): boolean {
  if (typeof window === "undefined") return useSandbox;
  const stored = localStorage.getItem("firestore-view-mode");
  if (stored !== null) return stored === "sandbox";
  return useSandbox;
}

/** Set Firestore view mode (localStorage + cookie for server). */
export function setFirestoreViewMode(useSandboxMode: boolean) {
  if (typeof window !== "undefined") {
    const mode = useSandboxMode ? "sandbox" : "production";
    localStorage.setItem("firestore-view-mode", mode);
    document.cookie = `firestore-view-mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  }
}
