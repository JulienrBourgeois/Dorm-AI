/**
 * Public Firebase Auth API. Import from here in Client Components or hooks.
 * All functions throw on failure; surface errors via getAuthErrorMessage + toast (e.g. Sonner).
 */
export { signIn, signUp, signOutUser } from "./emailPassword";
export { deleteAccount, reauthenticateWithEmail } from "./deleteAccount";
export { sendPasswordReset } from "./passwordReset";
export { sendVerificationEmail } from "./emailVerification";
export {
  createRecaptchaVerifier,
  sendPhoneCode,
  confirmPhoneCode,
  type RecaptchaVerifierOptions,
} from "./phone";
export { subscribeToAuthState } from "./state";
export type { ConfirmationResult } from "firebase/auth";
