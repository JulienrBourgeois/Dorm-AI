"use client";

import { COLLECTIONS, dateToTimestamp, setDocument } from "@/app/lib/firebase/firestore";
import type { AuditEvent } from "@/types";

type AuditEventInput = Omit<AuditEvent, "createdAt">;

export async function logAuditEvent(input: AuditEventInput) {
  const eventId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await setDocument(COLLECTIONS.auditEvents, eventId, {
    ...input,
    createdAt: dateToTimestamp(new Date()),
  });
}
