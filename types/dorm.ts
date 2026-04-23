/**
 * Inspect AI data model: unified types and enums for all entities.
 * Use WithId<T> when reading documents from Firestore (id from snapshot).
 * Date fields are Date in app code; Firestore stores Timestamp — use convert helpers when reading/writing.
 */

// --- Enums (string unions) ---

/** Where the organization primarily operates (for profiles and filtering). */
export type OrganizationType =
  | "APARTMENT_COMPLEX"
  | "UNIVERSITY"
  | "CORPORATE_BUILDING"
  | "MIXED_USE"
  | "OTHER";

export type MembershipRole = "ADMIN" | "INSPECTOR" | "TENANT";
export type MembershipStatus = "INVITED" | "ACTIVE" | "INACTIVE";
export type InspectionType = "MOVE_IN" | "ROUTINE" | "MOVE_OUT";
export type InspectionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";
export type InspectionSummaryStatus = "NONE" | "UNDER_REVIEW" | "FINALIZED";
export type InspectionItemResponse = "GOOD" | "FAIR" | "DAMAGED" | "NA";
export type MediaType = "PHOTO" | "VIDEO" | "AUDIO";
export type ChargeStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "DISPUTED"
  | "PAID"
  | "WAIVED";

/** User role from post-signup setup funnel. */
export type UserRole = "property_manager" | "inspector" | "tenant";

// --- Entity interfaces (optional id mirrors document id in stored payloads; use WithId<T> when id is required) ---

export interface User {
  /** Same as the Firestore document id (Auth uid or invite placeholder). */
  id?: string;
  name: string;
  email: string;
  /** Firebase Storage path for the user's profile photo. */
  profilePhotoPath?: string;
  phone?: string;
  gender?: string;
  bornAt?: Date;
  /** From setup funnel; YYYY-MM-DD (date only, no timezone). */
  dateOfBirth?: string;
  /** From setup funnel. */
  role?: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  /** Same as the Firestore document id. */
  id?: string;
  name: string;
  /** Internal stable id segment; not shown in UI. Routes use Firestore document id. */
  slug: string;
  organizationType?: OrganizationType;
  /** Street or building line; use with autocomplete="street-address". */
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  website?: string;
  /** Firebase Storage path for a site/property map image (organization-wide). */
  propertyMapStoragePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  /** Same as the Firestore document id. */
  id?: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
  /** TENANT */
  roomId?: string;
  classYear?: string;
  graduationYear?: number;
  /** INSPECTOR */
  employeeId?: string;
  assignedBuildingIds?: string[];
  /** ADMIN */
  title?: string;
}

export interface Building {
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  /** Latitude in decimal degrees. */
  latitude?: number;
  /** Longitude in decimal degrees. */
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  organizationId: string;
  buildingId: string;
  number: string;
  floor?: number;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  organizationId: string;
  roomId: string;
  inspectorId: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  aiSummary?: string;
  aiSummaryDraft?: string;
  aiSummaryStatus?: InspectionSummaryStatus;
  aiSummaryError?: string;
  aiSummaryGeneratedAt?: Date;
  aiSummaryGeneratedBy?: string;
  aiSummaryFinalizedAt?: Date;
  aiSummaryFinalizedBy?: string;
  roomLabel: string;
  tenantIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionItem {
  inspectionId: string;
  section: string;
  prompt: string;
  response: InspectionItemResponse;
  notes?: string;
  severity?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  inspectionId: string;
  inspectionItemId?: string;
  type: MediaType;
  storagePath: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface Charge {
  inspectionId: string;
  inspectionItemId?: string;
  title: string;
  amountCents: number;
  status: ChargeStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- WithId: document with id (e.g. from Firestore snapshot) ---

export type WithId<T> = T & { id: string };
