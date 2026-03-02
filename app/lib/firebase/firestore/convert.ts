/**
 * Firestore Timestamp <-> Date conversion. Use when reading/writing documents so app types use Date.
 * @see https://firebase.google.com/docs/firestore/manage-data/data-types
 */
import type { Timestamp } from "firebase/firestore";
import { Timestamp as FirestoreTimestamp } from "firebase/firestore";

/** Check if value is a Firestore Timestamp (has toDate). */
function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  );
}

/**
 * Convert a Firestore Timestamp to Date. Returns null if value is not a Timestamp.
 */
export function timestampToDate(value: unknown): Date | null {
  if (isTimestamp(value)) return value.toDate();
  return null;
}

/**
 * Convert a Date to Firestore Timestamp for writes.
 */
export function dateToTimestamp(date: Date): Timestamp {
  return FirestoreTimestamp.fromDate(date);
}

/**
 * Convert date fields of a document from Firestore Timestamp to Date (in place).
 * Use when reading a snapshot and you want the result to match domain types (Date fields).
 */
export function withDates<T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[]
): T {
  for (const key of dateFields) {
    const value = data[key];
    const date = timestampToDate(value);
    if (date !== null) (data as Record<string, unknown>)[key as string] = date;
  }
  return data;
}
