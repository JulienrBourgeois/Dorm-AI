import { joinInviteAbsoluteUrl } from "@/lib/joinInviteLink";

/**
 * Explains invite + join for property managers (tenants / inspectors tabs).
 * Example code is illustrative only.
 */
export function InviteJoinHelpCard() {
  const exampleUrl = joinInviteAbsoluteUrl("TEN-EXAMPLE");
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Invite and join flow</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-zinc-600 dark:text-zinc-400">
        <li>
          Enter the person&apos;s real name and the email they will use to sign in. Invites are tied to
          that email.
        </li>
        <li>
          They should create an account or sign in with that exact email, then open the link from the
          invite email or paste the code on the home dashboard.
        </li>
        <li>
          Join links look like{" "}
          <span className="break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {exampleUrl}
          </span>
          . Share it if email delivery fails.
        </li>
      </ol>
    </div>
  );
}
