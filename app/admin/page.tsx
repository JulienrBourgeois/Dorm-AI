import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your organizations — Inspect AI",
  description: "Choose an organization and open the right workspace for your role.",
};

export default function AdminOrganizationSelectorPage() {
  redirect("/home/dashboard");
}
