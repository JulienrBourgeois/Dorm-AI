/**
 * Send password reset email.
 * @see https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
 */
import { sendPasswordResetEmail } from "firebase/auth";
import type { ActionCodeSettings } from "firebase/auth";
import { auth } from "../app";

/**
 * Send a password reset email to the given address.
 * @param email - Email to send the reset link to.
 * @param actionCodeSettings - Optional continue URL and other settings for the reset link.
 */
export function sendPasswordReset(
  email: string,
  actionCodeSettings?: ActionCodeSettings
) {
  if (actionCodeSettings) {
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }
  return sendPasswordResetEmail(auth, email);
}
