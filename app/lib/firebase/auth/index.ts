/**
 * Public auth API. Import from here in Client Components or hooks.
 */
export { signIn, signUp, signOutUser } from "./emailPassword";
export { sendPasswordReset } from "./passwordReset";
export { sendVerificationEmail } from "./emailVerification";
export {
  createRecaptchaVerifier,
  sendPhoneCode,
  confirmPhoneCode,
  type RecaptchaVerifierOptions,
} from "./phone";
export type { ConfirmationResult } from "firebase/auth";
export { subscribeToAuthState } from "./state";
