# Firebase Storage (app/lib/firebase)

This project uses Cloud Storage for Firebase from **client-side code only**. The layer lives under `app/lib/firebase`: the same singleton app exports `storage`, and a modular **storage/** folder provides thin wrappers for upload, download URLs, delete, list, and metadata.

## Location and usage

- **`app/lib/firebase/app.ts`** — Firebase app singleton, `auth`, `db`, and `storage`. Do not import in Server Components.
- **`app/lib/firebase/storage/`** — Ref, upload, URL, delete, list, metadata. Import from `@/app/lib/firebase/storage` in **Client Components** or client-side hooks.

For advanced use (e.g. custom refs), import `storage` from `@/app/lib/firebase/app` and use `getStorageRef(path)` or Firebase Storage APIs directly.

## Bucket

Storage uses the bucket from the Firebase app config, which comes from **`getStorageBucketName()`** in [app/lib/env.ts](app/lib/env.ts). Sandbox vs prod is driven by `useSandbox` and the env vars described in [Environment variables](environment-variables.md) (e.g. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_SANDBOX`).

## Storage modules

| Module | Exports | Use for |
|--------|--------|--------|
| **ref** | `getStorageRef` | Get a StorageReference from a path string. |
| **upload** | `uploadFile`, `uploadFileResumable` | Upload bytes (File/Blob); resumable returns UploadTask for progress. |
| **url** | `getDownloadUrl` | Get download URL for img/video src or fetch. |
| **delete** | `deleteFile` | Delete object by path. |
| **list** | `listFiles`, `listAllFiles` | List objects (paginated or full) under a prefix. |
| **metadata** | `getFileMetadata` | Get contentType, size, updated, etc. |

## Examples

### Upload a file and get its URL

```tsx
"use client";

import { uploadFile, getDownloadUrl } from "@/app/lib/firebase/storage";

async function handleFileSelect(file: File, userId: string) {
  const path = `images/${userId}/${file.name}`;
  await uploadFile(path, file, { contentType: file.type });
  const url = await getDownloadUrl(path);
  return url; // use in img src or save to Firestore
}
```

### Get download URL for existing path (img / video)

```tsx
"use client";

import { getDownloadUrl } from "@/app/lib/firebase/storage";

export function StorageImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    getDownloadUrl(path).then(setUrl);
  }, [path]);
  if (!url) return <span>Loading…</span>;
  return <img src={url} alt="" />;
}
```

### Resumable upload with progress

```tsx
"use client";

import { getDownloadUrl, uploadFileResumable } from "@/app/lib/firebase/storage";

const path = "videos/clip.mp4";
const task = uploadFileResumable(path, file, { contentType: file.type });
task.on("state_changed", (snapshot) => {
  const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  setProgress(pct);
});
await task;
const url = await getDownloadUrl(path);
```

### Delete by path

```tsx
"use client";

import { deleteFile } from "@/app/lib/firebase/storage";

await deleteFile("images/uid/old-photo.jpg");
```

### List files under a prefix

```tsx
"use client";

import { listFiles, listAllFiles } from "@/app/lib/firebase/storage";

// Paginated (for large dirs)
const result = await listFiles("images/uid", { maxResults: 100 });
result.items.forEach((ref) => console.log(ref.fullPath));
if (result.nextPageToken) {
  const next = await listFiles("images/uid", { pageToken: result.nextPageToken });
}

// All at once (small dirs)
const all = await listAllFiles("images/uid");
all.items.forEach((ref) => console.log(ref.fullPath));
all.prefixes.forEach((ref) => console.log("Folder:", ref.fullPath));
```

## Official docs

- [Upload files](https://firebase.google.com/docs/storage/web/upload-files)
- [Download files](https://firebase.google.com/docs/storage/web/download-files)
- [Delete objects](https://firebase.google.com/docs/storage/web/delete-objects)
- [List files](https://firebase.google.com/docs/storage/web/list-files)
- [File metadata](https://firebase.google.com/docs/storage/web/file-metadata)
