import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { verifyFirebaseBearer } from "@/lib/auth/verifyFirebaseBearer";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";

export async function POST(request: Request) {
  const user = await verifyFirebaseBearer(request);
  if (!user) {
    return apiError(new AppError("UNAUTHORIZED", "Invalid or missing token", 401));
  }

  const db = getAdminFirestore();
  const userRef = db.collection(COLLECTIONS.users).doc(user.uid);

  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data();
    if (data?.welcomeEmailSentAt != null) return false;
    tx.set(
      userRef,
      { welcomeEmailSentAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return true;
  });

  if (!claimed) {
    return apiOk({ sent: false, skipped: "already_sent" as const });
  }

  const clearClaim = () =>
    userRef.set({ welcomeEmailSentAt: FieldValue.delete() }, { merge: true });

  const result = await sendWelcomeEmail({
    to: user.email,
    displayName: user.name,
  });

  if (!result.ok && result.reason === "not_configured") {
    await clearClaim();
    return apiOk({ sent: false, skipped: "resend_not_configured" as const });
  }
  if (!result.ok) {
    await clearClaim();
    return apiError(new AppError("EMAIL_FAILED", result.reason, 502));
  }
  return apiOk({ sent: true as const });
}
