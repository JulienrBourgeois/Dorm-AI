import { Resend } from "resend";
import { getResendApiKey } from "@/lib/email/config";

let client: Resend | null | undefined;

export function getResend(): Resend | null {
  if (client !== undefined) return client;
  const key = getResendApiKey();
  client = key ? new Resend(key) : null;
  return client;
}
