# Firestore (app/lib/firebase)

This project uses Cloud Firestore from **client-side code only**. The layer lives under `app/lib/firebase`: the same singleton app exports `db`, and a modular **firestore/** folder provides thin wrappers for create, read, update, delete, and realtime listeners.

## Location and usage

- **`app/lib/firebase/app.ts`** — Firebase app singleton, `auth`, and `db` (Firestore). Do not import in Server Components.
- **`app/lib/firebase/firestore/`** — Create, read, update, delete, and listeners. Import from `@/app/lib/firebase/firestore` in **Client Components** or client-side hooks.

For advanced use (e.g. building `Query` objects), import `db` from `@/app/lib/firebase/app` and use `doc()`, `collection()`, `query()` from `firebase/firestore` as needed.

## Environment and sandbox

Firebase config is the same as for Auth; see [Environment variables](environment-variables.md).

When the environment is **sandbox** (local development or Vercel Preview, or when `NEXT_PUBLIC_FIREBASE_USE_SANDBOX=true`), the app uses:

- **Firestore:** a separate Firestore database with ID **`sandbox`** (see [Firestore multiple databases](https://firebase.google.com/docs/firestore/manage-databases)). Production uses the default database. The database ID is chosen by `getFirestoreDatabaseId()` in `app/lib/env.ts`; `db` in `app/lib/firebase/app.ts` is initialized with that ID.
- **Storage:** fixed bucket names `dorm-ai-sandbox` (sandbox) and `dorm-ai.firebasestorage.app` (prod) in `app/lib/env.ts`; `getStorageBucketName()` returns the active one.

The app also exposes **`useFirestoreSandbox`** and **`getFirestoreViewMode()`** / **`setFirestoreViewMode()`** in `app/lib/env.ts` for UI that needs to show or toggle sandbox vs production view. You must create the `sandbox` database in the Firebase Console (or gcloud) before using it; the default database is used for production.

## Firestore modules

| Module | Exports | Use for |
|--------|--------|--------|
| **create** | `setDocument`, `addDocument` | Create or overwrite a document by ID; add a document with auto-generated ID. |
| **read** | `getDocument`, `getDocumentData`, `getCollection` | One-time read of a document (snapshot or `{ data, exists }`); one-time read of a collection. |
| **update** | `updateDocument` | Partial update of an existing document (specific fields only). |
| **delete** | `deleteDocument` | Delete a document by path. |
| **listeners** | `subscribeDocument`, `subscribeCollection` | Realtime subscriptions; return an unsubscribe function. |

## Examples

### Create a document (set or add)

```tsx
"use client";

import { setDocument, addDocument } from "@/app/lib/firebase/firestore";

// Set with explicit ID (overwrites unless merge: true)
await setDocument("users", userId, { name: "Jane", email: "jane@example.com" });
await setDocument("users", userId, { role: "admin" }, { merge: true });

// Add with auto-generated ID
const ref = await addDocument("posts", { title: "Hello", authorId: userId });
console.log(ref.id);
```

### Read once (getDoc / getDocs)

```tsx
"use client";

import { getDocumentData, getCollection } from "@/app/lib/firebase/firestore";

const { data, exists } = await getDocumentData<{ name: string }>("users", userId);
if (exists && data) console.log(data.name);

const snapshot = await getCollection("posts");
snapshot.docs.forEach((d) => console.log(d.id, d.data()));
```

### Update a document

```tsx
"use client";

import { updateDocument } from "@/app/lib/firebase/firestore";

await updateDocument("users", userId, { lastLoginAt: new Date(), role: "member" });
```

### Delete a document

```tsx
"use client";

import { deleteDocument } from "@/app/lib/firebase/firestore";

await deleteDocument("posts", postId);
```

### Listen to a document (unsubscribe in useEffect)

```tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeDocument } from "@/app/lib/firebase/firestore";

export function usePost(postId: string | null) {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    if (!postId) return;
    const unsub = subscribeDocument(
      "posts",
      postId,
      (snapshot) => setData(snapshot.exists() ? snapshot.data() : null),
      (err) => console.error(err)
    );
    return unsub;
  }, [postId]);
  return data;
}
```

### Listen to a collection (unsubscribe in useEffect)

```tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeCollection } from "@/app/lib/firebase/firestore";

export function usePosts() {
  const [docs, setDocs] = useState<Array<{ id: string; data: () => unknown }>>([]);
  useEffect(() => {
    const unsub = subscribeCollection(
      "posts",
      (snapshot) => setDocs(snapshot.docs),
      (err) => console.error(err)
    );
    return unsub;
  }, []);
  return docs;
}
```

## Official docs

- [Add data](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Get data](https://firebase.google.com/docs/firestore/query-data/get-data)
- [Listen to data](https://firebase.google.com/docs/firestore/query-data/listen)
- [Delete data](https://firebase.google.com/docs/firestore/manage-data/delete-data)
