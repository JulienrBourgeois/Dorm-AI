/**
 * Send password reset email.
 * Errors are not handled here; callers should use getAuthErrorMessage + toast.
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
): Promise<void> {
  return actionCodeSettings
    ? sendPasswordResetEmail(auth, email, actionCodeSettings)
    : sendPasswordResetEmail(auth, email);
}
