import { getAdminAuth } from "@/app/lib/firebase/admin";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";

export const dynamic = "force-dynamic";

type Body = { email?: string };

function isUserNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "auth/user-not-found"
  );
}

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Returns: { exists: boolean } — whether a Firebase Auth user exists for that email.
 * Invite placeholders live in Firestore `users` before sign-up; they must not count as
 * “existing accounts” for invite routing or forgot-password.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const email = requireString(body?.email, "email", { minLength: 3, maxLength: 320 });
    const normalized = email.trim().toLowerCase();
    try {
      await getAdminAuth().getUserByEmail(normalized);
      return apiOk({ exists: true });
    } catch (err: unknown) {
      if (isUserNotFound(err)) {
        return apiOk({ exists: false });
      }
      throw err;
    }
  } catch (err) {
    console.error("[check-email]", err);
    if (err instanceof AppError) return apiError(err);
    return apiError(new AppError("INTERNAL_ERROR", "Failed to check email", 500));
  }
}
