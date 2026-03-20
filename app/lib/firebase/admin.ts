/**
 * Firebase Admin SDK — server-only (API routes, Server Components).
 * Do not import in client code. Uses service account credentials from env.
 */
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFirestoreDatabaseId } from "@/app/lib/env";

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env: FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY"
    );
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

/**
 * Admin Auth instance (session cookies, verify ID tokens). Use only in server code.
 */
export function getAdminAuth(): admin.auth.Auth {
  return getAuth(getAdminApp());
}

/**
 * Admin Firestore instance (bypasses security rules). Use only in server code.
 */
export function getAdminFirestore(): admin.firestore.Firestore {
  const app = getAdminApp();
  const databaseId = getFirestoreDatabaseId();
  return getFirestore(app, databaseId);
}
