import { redirect } from "next/navigation";

/**
 * Preserves deep-link targets (e.g. invite flow). Sends users into the signup funnel
 * on the email step when we already know which address to use.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const nextRaw = searchParams.next;
  const next = typeof nextRaw === "string" ? nextRaw : Array.isArray(nextRaw) ? nextRaw[0] : "";
  const inviteEmailRaw = searchParams.inviteEmail ?? searchParams.email;
  const inviteEmail =
    typeof inviteEmailRaw === "string"
      ? inviteEmailRaw
      : Array.isArray(inviteEmailRaw)
        ? inviteEmailRaw[0]
        : "";

  const qs = new URLSearchParams();
  const isJoinReturn = next.includes("/join");

  if (typeof inviteEmail === "string" && inviteEmail.includes("@") && isJoinReturn) {
    qs.set("step", "email-login");
    qs.set("email", inviteEmail);
  } else {
    qs.set("step", "login-chooser");
  }

  if (next.startsWith("/")) {
    qs.set("next", next);
  } else if (typeof inviteEmail === "string" && inviteEmail.includes("@")) {
    qs.set("email", inviteEmail);
  }

  redirect(`/signup?${qs.toString()}`);
}
