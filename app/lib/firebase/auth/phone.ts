/**
 * Phone sign-in via SMS code flow. Client-only; requires a DOM element for reCAPTCHA.
 * @see https://firebase.google.com/docs/auth/web/phone-auth
 */
import {
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../app";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export interface RecaptchaVerifierOptions {
  size?: "normal" | "compact" | "invisible";
  callback?: (response: unknown) => void;
  "expired-callback"?: () => void;
}

/**
 * Create and store a RecaptchaVerifier. Call from a Client Component after the container is in the DOM.
 * @param containerOrId - Element ID string or HTMLElement to render the reCAPTCHA widget (or anchor for invisible).
 * @param options - size, callback, expired-callback per Firebase docs.
 */
export function createRecaptchaVerifier(
  containerOrId: string | HTMLElement,
  options?: RecaptchaVerifierOptions
): RecaptchaVerifier {
  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerOrId,
    options ?? {}
  );
  return recaptchaVerifier;
}

/**
 * Send SMS verification code to the given phone number. Requires createRecaptchaVerifier to have been called first.
 * @returns ConfirmationResult; pass it and the user-entered code to confirmPhoneCode.
 */
export function sendPhoneCode(phoneNumber: string): Promise<ConfirmationResult> {
  if (!recaptchaVerifier) {
    return Promise.reject(
      new Error("Call createRecaptchaVerifier before sendPhoneCode")
    );
  }
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

/**
 * Complete phone sign-in with the code from the SMS.
 * @param confirmationResult - Value returned from sendPhoneCode.
 * @param code - The 6-digit code the user received.
 */
export function confirmPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
) {
  return confirmationResult.confirm(code);
}
