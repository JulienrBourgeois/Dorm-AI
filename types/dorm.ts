/**
 * Dorm AI data model: unified types and enums for all entities.
 * Use WithId<T> when reading documents from Firestore (id from snapshot).
 * Date fields are Date in app code; Firestore stores Timestamp — use convert helpers when reading/writing.
 */

// --- Enums (string unions) ---

export type MembershipRole = "ADMIN" | "INSPECTOR" | "TENANT";
export type MembershipStatus = "INVITED" | "ACTIVE" | "INACTIVE";
export type InspectionType = "MOVE_IN" | "ROUTINE" | "MOVE_OUT";
export type InspectionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";
export type InspectionItemResponse = "GOOD" | "FAIR" | "DAMAGED" | "NA";
export type MediaType = "PHOTO" | "VIDEO" | "AUDIO";
export type ChargeStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "DISPUTED"
  | "PAID"
  | "WAIVED";

// --- Entity interfaces (id omitted; use WithId<T> when document has id) ---

export interface User {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  bornAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  userId: string;
  universityId: string;
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
  universityId: string;
  name: string;
  code: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  universityId: string;
  buildingId: string;
  number: string;
  floor?: number;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  universityId: string;
  roomId: string;
  inspectorId: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  aiSummary?: string;
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
