import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  redirect("/signup?step=forgot-password");
}
