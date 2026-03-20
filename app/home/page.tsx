import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/app/lib/firebase/admin";
import { getRedirectPathForUid } from "@/lib/auth/redirectPathServer";

const SESSION_COOKIE_NAME = "__session";

/**
 * /home — redirect to the user's portal by role (inspector → /inspector, tenant → /tenant, else → /admin/dashboard).
 * If no session, send to signup.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore
    .get(SESSION_COOKIE_NAME)
    ?.value;
  if (!sessionCookie) {
    redirect("/signup");
  }
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const path = await getRedirectPathForUid(decoded.uid);
    redirect(path);
  } catch {
    redirect("/signup");
  }
}
