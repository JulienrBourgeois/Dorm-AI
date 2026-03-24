import { getAdminAuth } from "@/app/lib/firebase/admin";

export type VerifiedBearerUser = {
  uid: string;
  email: string;
  name?: string;
};

/** Verify Firebase ID token from `Authorization: Bearer <token>`. */
export async function verifyFirebaseBearer(
  request: Request,
): Promise<VerifiedBearerUser | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = decoded.email;
    if (!email || typeof email !== "string") return null;
    return {
      uid: decoded.uid,
      email,
      name: typeof decoded.name === "string" ? decoded.name : undefined,
    };
  } catch {
    return null;
  }
}
