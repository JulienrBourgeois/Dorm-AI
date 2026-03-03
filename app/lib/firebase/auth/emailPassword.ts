/**
 * Email/password sign up, sign in, and sign out.
 * Errors are not handled here; callers should use getAuthErrorMessage + toast.
 * @see https://firebase.google.com/docs/auth/web/password-auth
 * @see https://firebase.google.com/docs/auth/web/manage-users
 */
import type { UserCredential } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../app";

/** Create a new account and sign in. */
export function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign in with email and password. */
export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sign out the current user. */
export function signOutUser(): Promise<void> {
  return signOut(auth);
}
