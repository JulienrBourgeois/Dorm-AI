/** Append organizationId for org-scoped admin routes (query string). */
export function withAdminOrganizationId(path: string, organizationId: string): string {
  const oid = organizationId.trim();
  if (!oid) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}organizationId=${encodeURIComponent(oid)}`;
}
