const ERROR_MAP: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/invalid-phone-number": "Please enter a valid phone number (e.g. +1234567890).",
  "auth/invalid-verification-code": "Invalid verification code. Please try again.",
  "auth/code-expired": "Verification code expired. Please request a new one.",
  "auth/missing-phone-number": "Please enter a phone number.",
};

/** Map Firebase error codes to user-friendly messages. */
export function getAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? (error as { code: string }).code
      : "";
  return (
    ERROR_MAP[code] ??
    (error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.")
  );
}
