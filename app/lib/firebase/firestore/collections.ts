/**
 * Firestore collection name constants. Use with setDocument, getDocument, etc.
 */
export const COLLECTIONS = {
  users: "users",
  universities: "universities",
  memberships: "memberships",
  buildings: "buildings",
  rooms: "rooms",
  inspections: "inspections",
  inspectionItems: "inspectionItems",
  media: "media",
  charges: "charges",
} as const;
