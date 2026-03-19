import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore";

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
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }
    const db = getAdminFirestore();
    const snapshot = await db
      .collection(COLLECTIONS.users)
      .where("email", "==", email)
      .limit(1)
      .get();
    return NextResponse.json({ exists: !snapshot.empty });
  } catch (err) {
    console.error("[check-email]", err);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
