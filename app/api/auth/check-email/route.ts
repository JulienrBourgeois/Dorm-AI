import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";

export const dynamic = "force-dynamic";

type Body = { email?: string };

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Returns: { exists: boolean } — whether a user document with that email exists.
 * Used by forgot-password to avoid sending reset emails for unknown addresses.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const email = requireString(body?.email, "email", { minLength: 3, maxLength: 320 });
    const db = getAdminFirestore();
    const snapshot = await db
      .collection(COLLECTIONS.users)
      .where("email", "==", email)
      .limit(1)
      .get();
    return apiOk({ exists: !snapshot.empty });
  } catch (err) {
    console.error("[check-email]", err);
    if (err instanceof AppError) return apiError(err);
    return apiError(new AppError("INTERNAL_ERROR", "Failed to check email", 500));
  }
}
