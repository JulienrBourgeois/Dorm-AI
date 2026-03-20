"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";

const INSPECTOR_PORTAL_PATH = "/inspector-portal";
const LOGIN_PATH = "/signup?step=login-chooser";

export function InspectorPortalAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const didRedirectRef = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((u) => {
      setUser(u);
      setChecked(true);

      if (!u) {
        if (!didRedirectRef.current) {
          didRedirectRef.current = true;
          const next = encodeURIComponent(INSPECTOR_PORTAL_PATH);
          router.replace(`${LOGIN_PATH}&next=${next}`, { scroll: false });
        }
      } else {
        didRedirectRef.current = false;
      }
    });

    return unsubscribe;
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        Checking access…
      </div>
    );
  }

  // We redirect client-side when unauthenticated.
  if (!user) return null;

  return <>{children}</>;
}

