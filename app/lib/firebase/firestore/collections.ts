/**
 * Firestore collection name constants. Use with setDocument, getDocument, etc.
 */
export const COLLECTIONS = {
  users: "users",
  organizations: "organizations",
  memberships: "memberships",
  inviteCodes: "inviteCodes",
  buildings: "buildings",
  rooms: "rooms",
  inspections: "inspections",
  inspectionItems: "inspectionItems",
  media: "media",
  charges: "charges",
  auditEvents: "auditEvents",
} as const;
