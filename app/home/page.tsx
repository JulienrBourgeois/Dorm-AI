import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";

const SESSION_COOKIE_NAME = "__session";

/**
 * /home — authenticated users go to the shared hub (/home/dashboard) after profile setup.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    redirect("/signup");
  }
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const firestore = getAdminFirestore();
    const doc = await firestore.collection(COLLECTIONS.users).doc(decoded.uid).get();
    const data = doc.data() as { dateOfBirth?: string } | undefined;
    if (!data?.dateOfBirth) {
      redirect("/setup-funnel");
    }
    redirect("/home/dashboard");
  } catch {
    redirect("/signup");
  }
}
