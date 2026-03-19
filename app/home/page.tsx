import type { Metadata } from "next";
import { HomeDashboard } from "./HomeDashboard";

export const metadata: Metadata = {
  title: "Home — Dorm AI",
  description: "Your Dorm AI dashboard.",
};

export default function HomePage() {
  return <HomeDashboard />;
}
