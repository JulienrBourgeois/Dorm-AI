import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/signup?step=login-chooser");
}
