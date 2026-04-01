import { redirect } from "next/navigation";

type Search = { e?: string | string[] };

function firstString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

/** Short join link: /join/CODE?e=email → /join?code=CODE&e=email */
export default function JoinWithCodeRedirect({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams?: Search;
}) {
  const raw = params.code?.trim() ?? "";
  if (!raw) {
    redirect("/join");
  }
  const code = raw.toUpperCase();
  const e = firstString(searchParams?.e).trim();
  const q = new URLSearchParams({ code });
  if (e) q.set("e", e);
  redirect(`/join?${q.toString()}`);
}
