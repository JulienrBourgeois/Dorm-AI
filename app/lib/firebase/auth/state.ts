/**
 * Auth state subscription for use in Client Components or hooks (e.g. useAuth).
 * @see https://firebase.google.com/docs/auth/web/start#set_an_authentication_state_observer
 */
import type { Unsubscribe } from "firebase/auth";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app";

/**
 * Subscribe to auth state changes. Call the returned function to unsubscribe.
 * @param callback - Called with the current User or null when sign-in state changes.
 */
export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
