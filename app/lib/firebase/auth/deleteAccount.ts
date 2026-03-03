/**
 * Delete account and reauthenticate (for use before delete when required).
 * Errors are not handled here; callers should use getAuthErrorMessage + toast.
 * @see https://firebase.google.com/docs/auth/web/manage-users#delete_a_user
 */
import type { UserCredential } from "firebase/auth";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../app";

/**
 * Delete the currently signed-in user. Signs the user out on success.
 * If the session is too old, Firebase may throw; catch and call
 * reauthenticateWithEmail() then retry deleteAccount().
 */
export function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("No user signed in"));
  return deleteUser(user);
}

/**
 * Reauthenticate the current user with email and password. Call before
 * deleteAccount() if it fails with a credential-too-old error.
 */
export function reauthenticateWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("No user signed in"));
  const credential = EmailAuthProvider.credential(email, password);
  return reauthenticateWithCredential(user, credential);
}
