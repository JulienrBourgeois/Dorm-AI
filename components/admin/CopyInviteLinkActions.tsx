"use client";

import { toast } from "sonner";
import { joinInviteAbsoluteUrl } from "@/lib/joinInviteLink";
import { adminSecondaryBtnClass } from "@/components/admin/adminConsolePrimitives";

type Props = {
  code: string;
  /** If set, link includes ?e= so sign-in matches the invited address. */
  inviteeEmail?: string;
  /** When false, only "Copy join link" is shown (compact table actions). */
  showCodeButton?: boolean;
  className?: string;
};

export function CopyInviteLinkActions({
  code,
  inviteeEmail,
  showCodeButton = true,
  className = "",
}: Props) {
  const normalized = code.trim().toUpperCase();
  const em =
    inviteeEmail?.trim().includes("@") ? inviteeEmail.trim().toLowerCase() : undefined;
  const url = joinInviteAbsoluteUrl(normalized, em);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void copyText(url, "Join link")}
        className={adminSecondaryBtnClass}
      >
        Copy join link
      </button>
      {showCodeButton ? (
        <button
          type="button"
          onClick={() => void copyText(normalized, "Invite code")}
          className={adminSecondaryBtnClass}
        >
          Copy code
        </button>
      ) : null}
    </div>
  );
}
