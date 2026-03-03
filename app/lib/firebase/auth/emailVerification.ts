/**
 * Send email verification for the current user.
 * Errors are not handled here; callers should use getAuthErrorMessage + toast.
 * @see https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email
 */
import { sendEmailVerification } from "firebase/auth";
import type { ActionCodeSettings } from "firebase/auth";
import { auth } from "../app";

/**
 * Send a verification email to the currently signed-in user.
 * Requires auth.currentUser to be non-null.
 */
export function sendVerificationEmail(
  actionCodeSettings?: ActionCodeSettings
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("No signed-in user"));
  return actionCodeSettings
    ? sendEmailVerification(user, actionCodeSettings)
    : sendEmailVerification(user);
}
