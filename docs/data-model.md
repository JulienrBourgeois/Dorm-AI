# Dorm AI data model

Unified TypeScript types and Firestore collection layout for Dorm AI entities. Use the same types across the app and when reading/writing Firestore.

## Where things live

| What | Location |
|------|----------|
| Entity types and enums | [types/dorm.ts](../types/dorm.ts) (re-exported from [types/index.ts](../types/index.ts)) |
| Collection name constants | [app/lib/firebase/firestore/collections.ts](../app/lib/firebase/firestore/collections.ts) |
| Timestamp/Date converters | [app/lib/firebase/firestore/convert.ts](../app/lib/firebase/firestore/convert.ts) |

## Firestore collection mapping

| Entity | Collection | Main FKs |
|--------|------------|----------|
| User | `users` | — |
| University | `universities` | — |
| Membership | `memberships` | userId, universityId |
| Building | `buildings` | universityId |
| Room | `rooms` | universityId, buildingId |
| Inspection | `inspections` | universityId, roomId, inspectorId, createdBy |
| InspectionItem | `inspectionItems` | inspectionId |
| Media | `media` | inspectionId, uploadedBy |
| Charge | `charges` | inspectionId, createdBy |

All collections are top-level. Document IDs are either Firebase Auth UID (users), auto-generated, or slug-based (e.g. universities) as needed.

## Date fields and Firestore

- **In TypeScript types:** Date fields are `Date` (e.g. `User.createdAt`, `Inspection.scheduledFor`).
- **In Firestore:** Dates are stored as Firestore `Timestamp`. On create/update, set `createdAt`/`updatedAt` with `serverTimestamp()` (Cloud Functions) or `Timestamp.fromDate(new Date())` / `dateToTimestamp(new Date())` from the convert module.
- **When reading:** Use `timestampToDate(snapshot.get("createdAt"))` for a single field, or `withDates(data, ["createdAt", "updatedAt"])` to convert several date fields of a document so the result matches the domain type.

## WithId

When you read a document from Firestore, the document ID is on the snapshot, not in the data. Use the generic `WithId<T>` for “document with id”:

```ts
import type { User, WithId } from "@/types";
import { getDocumentData, COLLECTIONS, withDates } from "@/app/lib/firebase/firestore";

const { data: raw } = await getDocumentData(COLLECTIONS.users, userId);
const data = raw ? withDates(raw, ["createdAt", "updatedAt", "bornAt"]) as User : undefined;
const user: WithId<User> | undefined = data ? { ...data, id: userId } : undefined;
```

## Example: create a user

```ts
"use client";

import { setDocument, COLLECTIONS, dateToTimestamp } from "@/app/lib/firebase/firestore";

const now = new Date();
await setDocument(COLLECTIONS.users, authUserId, {
  name: "Jane Doe",
  email: "jane@example.com",
  createdAt: dateToTimestamp(now),
  updatedAt: dateToTimestamp(now),
});
```

(Alternatively use `serverTimestamp()` from `firebase/firestore` in Cloud Functions when creating from the backend.)

## Example: read inspection and items

```ts
"use client";

import { getDocumentData, getCollection, COLLECTIONS, withDates } from "@/app/lib/firebase/firestore";
import type { Inspection, InspectionItem, WithId } from "@/types";

const { data: inspRaw } = await getDocumentData(COLLECTIONS.inspections, inspectionId);
const inspection: WithId<Inspection> | undefined = inspRaw
  ? { ...withDates(inspRaw, ["scheduledFor", "startedAt", "completedAt", "createdAt", "updatedAt"]) as Inspection, id: inspectionId }
  : undefined;

const snapshot = await getCollection(COLLECTIONS.inspectionItems);
const items: WithId<InspectionItem>[] = snapshot.docs
  .filter((d) => d.data().inspectionId === inspectionId)
  .map((d) => {
    const data = withDates(d.data(), ["createdAt", "updatedAt"]) as InspectionItem;
    return { ...data, id: d.id };
  });
```

## Enums

Use the string-union types from `@/types`: `MembershipRole`, `MembershipStatus`, `InspectionType`, `InspectionStatus`, `InspectionItemResponse`, `MediaType`, `ChargeStatus`.
