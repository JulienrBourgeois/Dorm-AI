import { redirect } from "next/navigation";

type Search = { e?: string | string[] };

function firstString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

/** Short join link: /join/CODE?e=email → /join?code=CODE&e=email */
export default async function JoinWithCodeRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<Search>;
}) {
  const { code: codeParam } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const raw = codeParam?.trim() ?? "";
  if (!raw) {
    redirect("/join");
  }
  const code = raw.toUpperCase();
  const e = firstString(resolvedSearchParams?.e).trim();
  const q = new URLSearchParams({ code });
  if (e) q.set("e", e);
  redirect(`/join?${q.toString()}`);
}
