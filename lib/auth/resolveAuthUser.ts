import type { User } from "firebase/auth";
import { auth } from "@/app/lib/firebase/app";

/**
 * Resolves the signed-in user from an auth callback, avoiding false "signed out"
 * when `onAuthStateChanged` fires with null before `auth.currentUser` is restored.
 */
export async function resolveAuthUser(callbackUser: User | null): Promise<User | null> {
  if (callbackUser) return callbackUser;
  if (auth.currentUser) return auth.currentUser;
  await new Promise<void>((r) => setTimeout(r, 120));
  return auth.currentUser;
}
