/**
 * Email/password sign up, sign in, and sign out.
 * @see https://firebase.google.com/docs/auth/web/password-auth
 * @see https://firebase.google.com/docs/auth/web/manage-users
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../app";

/** Create a new account and sign in. Returns UserCredential. */
export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign in with email and password. Returns UserCredential. */
export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sign out the current user. */
export function signOutUser() {
  return signOut(auth);
}
