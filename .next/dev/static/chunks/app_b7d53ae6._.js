(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/env.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FIRESTORE_DATABASE_ID_SANDBOX",
    ()=>FIRESTORE_DATABASE_ID_SANDBOX,
    "STORAGE_BUCKET_PROD",
    ()=>STORAGE_BUCKET_PROD,
    "STORAGE_BUCKET_SANDBOX",
    ()=>STORAGE_BUCKET_SANDBOX,
    "getBaseUrl",
    ()=>getBaseUrl,
    "getEnvironmentDebug",
    ()=>getEnvironmentDebug,
    "getFirestoreDatabaseId",
    ()=>getFirestoreDatabaseId,
    "getFirestoreViewMode",
    ()=>getFirestoreViewMode,
    "getStorageBucketName",
    ()=>getStorageBucketName,
    "isLocalDev",
    ()=>isLocalDev,
    "isVercelPreview",
    ()=>isVercelPreview,
    "isVercelProduction",
    ()=>isVercelProduction,
    "logEnvironmentDebug",
    ()=>logEnvironmentDebug,
    "setFirestoreViewMode",
    ()=>setFirestoreViewMode,
    "useFirestoreSandbox",
    ()=>useFirestoreSandbox,
    "useSandbox",
    ()=>useSandbox,
    "useStripeSandbox",
    ()=>useStripeSandbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Environment flags and sandbox/prod helpers. Safe for client and server.
 * Do not import from Firebase here (avoids circular dependency).
 */ const hasProcess = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== "undefined";
const isVercelPreview = hasProcess && (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_ENV === "preview" || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VERCEL_ENV === "preview");
const isVercelProduction = hasProcess && (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_ENV === "production" || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VERCEL_ENV === "production");
const isLocalDev = hasProcess && ("TURBOPACK compile-time value", "development") === "development";
const sandboxFromEnv = hasProcess && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_USE_SANDBOX !== undefined ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FIREBASE_USE_SANDBOX === "true" : null;
const useSandbox = typeof sandboxFromEnv === "boolean" ? sandboxFromEnv : isVercelPreview || isLocalDev;
const FIRESTORE_DATABASE_ID_SANDBOX = "sandbox";
const STORAGE_BUCKET_SANDBOX = "dorm-ai-sandbox";
const STORAGE_BUCKET_PROD = "dorm-ai.firebasestorage.app";
function getFirestoreDatabaseId() {
    return useSandbox ? FIRESTORE_DATABASE_ID_SANDBOX : "(default)";
}
function getEnvironmentDebug() {
    return {
        NODE_ENV: hasProcess ? ("TURBOPACK compile-time value", "development") ?? "undefined" : "n/a",
        VERCEL_ENV: hasProcess ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_ENV ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VERCEL_ENV ?? undefined : undefined,
        isLocalDev,
        isVercelProduction,
        isVercelPreview,
        useSandbox,
        useFirestoreSandbox,
        storageBucketName: getStorageBucketName(),
        firestoreDatabaseId: getFirestoreDatabaseId(),
        hasFirebaseProjectId: hasProcess && !!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.FIREBASE_PROJECT_ID,
        hasFirebasePrivateKey: hasProcess && !!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.FIREBASE_ADMIN_PRIVATE_KEY
    };
}
function logEnvironmentDebug(label = "Environment") {
    if (typeof console === "undefined") return;
    console.info(`[${label}]`, JSON.stringify(getEnvironmentDebug(), null, 2));
}
const stripeSandboxOverride = undefined;
const firestoreSandboxOverride = undefined;
const useStripeSandbox = typeof stripeSandboxOverride === "boolean" ? stripeSandboxOverride : useSandbox;
const useFirestoreSandbox = typeof firestoreSandboxOverride === "boolean" ? firestoreSandboxOverride : useSandbox;
function getStorageBucketName() {
    return useSandbox ? STORAGE_BUCKET_SANDBOX : STORAGE_BUCKET_PROD;
}
function getBaseUrl() {
    if (isLocalDev) return "http://localhost:3000";
    if (isVercelPreview && hasProcess && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if (isVercelProduction && hasProcess && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return "";
}
function getFirestoreViewMode() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = localStorage.getItem("firestore-view-mode");
    if (stored !== null) return stored === "sandbox";
    return useSandbox;
}
function setFirestoreViewMode(useSandboxMode) {
    if ("TURBOPACK compile-time truthy", 1) {
        const mode = useSandboxMode ? "sandbox" : "production";
        localStorage.setItem("firestore-view-mode", mode);
        document.cookie = `firestore-view-mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/app.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Firebase app singleton and Auth instance.
 * Client-only: import only in Client Components or client-side code (e.g. hooks).
 * Do not import in Server Components.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/env.ts [app-client] (ecmascript)");
;
;
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyCdBBNeb9Mc7r94OVUQ9fDn9C0EP2wgE_Q"),
    authDomain: ("TURBOPACK compile-time value", "dorm-ai.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "dorm-ai"),
    storageBucket: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStorageBucketName"])(),
    messagingSenderId: ("TURBOPACK compile-time value", "542756410529"),
    appId: ("TURBOPACK compile-time value", "1:542756410529:web:ee5f32771933ef95a30ce0")
};
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApp"])();
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuth"])(app);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(app, (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestoreDatabaseId"])());
const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStorage"])(app);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/emailPassword.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signIn",
    ()=>signIn,
    "signOutUser",
    ()=>signOutUser,
    "signUp",
    ()=>signUp
]);
/**
 * Email/password sign up, sign in, and sign out.
 * @see https://firebase.google.com/docs/auth/web/password-auth
 * @see https://firebase.google.com/docs/auth/web/manage-users
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function signUp(email, password) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createUserWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, password);
}
function signIn(email, password) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signInWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, password);
}
function signOutUser() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/deleteAccount.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteAccount",
    ()=>deleteAccount,
    "reauthenticateWithEmail",
    ()=>reauthenticateWithEmail
]);
/**
 * Delete account and reauthenticate (for use before delete when required).
 * @see https://firebase.google.com/docs/auth/web/manage-users#delete_a_user
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function deleteAccount() {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) return Promise.reject(new Error("No user signed in"));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteUser"])(user);
}
function reauthenticateWithEmail(email, password) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) return Promise.reject(new Error("No user signed in"));
    const credential = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmailAuthProvider"].credential(email, password);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reauthenticateWithCredential"])(user, credential);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/passwordReset.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendPasswordReset",
    ()=>sendPasswordReset
]);
/**
 * Send password reset email.
 * @see https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function sendPasswordReset(email, actionCodeSettings) {
    if (actionCodeSettings) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, actionCodeSettings);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/emailVerification.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendVerificationEmail",
    ()=>sendVerificationEmail
]);
/**
 * Send email verification for the current user.
 * @see https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function sendVerificationEmail(actionCodeSettings) {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) {
        return Promise.reject(new Error("No signed-in user"));
    }
    if (actionCodeSettings) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendEmailVerification"])(user, actionCodeSettings);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendEmailVerification"])(user);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/phone.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "confirmPhoneCode",
    ()=>confirmPhoneCode,
    "createRecaptchaVerifier",
    ()=>createRecaptchaVerifier,
    "sendPhoneCode",
    ()=>sendPhoneCode
]);
/**
 * Phone sign-in via SMS code flow. Client-only; requires a DOM element for reCAPTCHA.
 * @see https://firebase.google.com/docs/auth/web/phone-auth
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
let recaptchaVerifier = null;
function createRecaptchaVerifier(containerOrId, options) {
    recaptchaVerifier = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RecaptchaVerifier"](__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], containerOrId, options ?? {});
    return recaptchaVerifier;
}
function sendPhoneCode(phoneNumber) {
    if (!recaptchaVerifier) {
        return Promise.reject(new Error("Call createRecaptchaVerifier before sendPhoneCode"));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signInWithPhoneNumber"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], phoneNumber, recaptchaVerifier);
}
function confirmPhoneCode(confirmationResult, code) {
    return confirmationResult.confirm(code);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/state.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Auth state subscription for use in Client Components or hooks (e.g. useAuth).
 * @see https://firebase.google.com/docs/auth/web/start#set_an_authentication_state_observer
 */ __turbopack_context__.s([
    "subscribeToAuthState",
    ()=>subscribeToAuthState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function subscribeToAuthState(callback) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], callback);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/auth/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Public auth API. Import from here in Client Components or hooks.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailPassword$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/emailPassword.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$deleteAccount$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/deleteAccount.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$passwordReset$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/passwordReset.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailVerification$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/emailVerification.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/phone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/state.ts [app-client] (ecmascript)");
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/create.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Create documents in Firestore (set with explicit ID or add with auto ID).
 * @see https://firebase.google.com/docs/firestore/manage-data/add-data
 */ __turbopack_context__.s([
    "addDocument",
    ()=>addDocument,
    "setDocument",
    ()=>setDocument
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function setDocument(collectionPath, documentId, data, options) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath, documentId);
    return options ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(ref, data, options) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(ref, data);
}
function addDocument(collectionPath, data) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath), data);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/read.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * One-time read of Firestore documents or collections.
 * @see https://firebase.google.com/docs/firestore/query-data/get-data
 */ __turbopack_context__.s([
    "getCollection",
    ()=>getCollection,
    "getDocument",
    ()=>getDocument,
    "getDocumentData",
    ()=>getDocumentData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function getDocument(collectionPath, documentId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath, documentId));
}
async function getDocumentData(collectionPath, documentId) {
    const snapshot = await getDocument(collectionPath, documentId);
    return {
        data: snapshot.exists() ? snapshot.data() : undefined,
        exists: snapshot.exists()
    };
}
function getCollection(collectionPath) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/update.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Update existing Firestore document fields (partial update).
 * @see https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
 */ __turbopack_context__.s([
    "updateDocument",
    ()=>updateDocument
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function updateDocument(collectionPath, documentId, data) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath, documentId), data);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/delete.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteDocument",
    ()=>deleteDocument
]);
/**
 * Delete Firestore documents.
 * @see https://firebase.google.com/docs/firestore/manage-data/delete-data
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function deleteDocument(collectionPath, documentId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath, documentId));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/listeners.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Realtime Firestore listeners (onSnapshot). Return unsubscribe from Client Components/hooks.
 * @see https://firebase.google.com/docs/firestore/query-data/listen
 */ __turbopack_context__.s([
    "subscribeCollection",
    ()=>subscribeCollection,
    "subscribeDocument",
    ()=>subscribeDocument
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
;
;
function subscribeDocument(collectionPath, documentId, onNext, onError) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath, documentId);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(ref, onNext, onError ?? undefined);
}
function subscribeCollection(collectionPath, onNext, onError) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionPath);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(ref, onNext, onError ?? undefined);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/collections.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Firestore collection name constants. Use with setDocument, getDocument, etc.
 */ __turbopack_context__.s([
    "COLLECTIONS",
    ()=>COLLECTIONS
]);
const COLLECTIONS = {
    users: "users",
    universities: "universities",
    memberships: "memberships",
    buildings: "buildings",
    rooms: "rooms",
    inspections: "inspections",
    inspectionItems: "inspectionItems",
    media: "media",
    charges: "charges"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/convert.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Firestore Timestamp <-> Date conversion. Use when reading/writing documents so app types use Date.
 * @see https://firebase.google.com/docs/firestore/manage-data/data-types
 */ __turbopack_context__.s([
    "dateToTimestamp",
    ()=>dateToTimestamp,
    "timestampToDate",
    ()=>timestampToDate,
    "withDates",
    ()=>withDates
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
;
/** Check if value is a Firestore Timestamp (has toDate). */ function isTimestamp(value) {
    return typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function";
}
function timestampToDate(value) {
    if (isTimestamp(value)) return value.toDate();
    return null;
}
function dateToTimestamp(date) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].fromDate(date);
}
function withDates(data, dateFields) {
    for (const key of dateFields){
        const value = data[key];
        const date = timestampToDate(value);
        if (date !== null) data[key] = date;
    }
    return data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/lib/firebase/firestore/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Public Firestore API. Import from here in Client Components or hooks.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$create$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/create.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/read.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$update$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/update.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$delete$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/delete.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$listeners$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/listeners.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/collections.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$convert$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/convert.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/login/lib/adminAuth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Admin auth helpers: user upsert, admin access check, session cookie, error messages.
 * Client-only; used by the admin login funnel after Firebase Auth completes.
 */ __turbopack_context__.s([
    "checkAdminAccess",
    ()=>checkAdminAccess,
    "clearAuthCookie",
    ()=>clearAuthCookie,
    "getAuthErrorMessage",
    ()=>getAuthErrorMessage,
    "setAuthCookie",
    ()=>setAuthCookie,
    "upsertUserDoc",
    ()=>upsertUserDoc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/app.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$create$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/create.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/read.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/collections.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$convert$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/firestore/convert.ts [app-client] (ecmascript)");
;
;
;
async function upsertUserDoc(user) {
    const { exists } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$read$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocumentData"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLLECTIONS"].users, user.uid);
    const now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$convert$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dateToTimestamp"])(new Date());
    if (!exists) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$create$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDocument"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLLECTIONS"].users, user.uid, {
            name: user.displayName ?? "",
            email: user.email ?? "",
            phone: user.phoneNumber ?? "",
            createdAt: now,
            updatedAt: now
        });
    } else {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$create$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDocument"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLLECTIONS"].users, user.uid, {
            email: user.email ?? "",
            phone: user.phoneNumber ?? "",
            updatedAt: now
        }, {
            merge: true
        });
    }
}
async function checkAdminAccess(userId) {
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$firestore$2f$collections$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLLECTIONS"].memberships), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])("userId", "==", userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])("role", "==", "ADMIN"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])("status", "==", "ACTIVE"));
    const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
    return !snapshot.empty;
}
function setAuthCookie(token) {
    document.cookie = `admin-session=${token}; path=/; max-age=3600; SameSite=Strict`;
}
function clearAuthCookie() {
    document.cookie = "admin-session=; path=/; max-age=0; SameSite=Strict";
}
const ERROR_MAP = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/invalid-phone-number": "Please enter a valid phone number (e.g. +1234567890).",
    "auth/invalid-verification-code": "Invalid verification code. Please try again.",
    "auth/code-expired": "Verification code expired. Please request a new one.",
    "auth/missing-phone-number": "Please enter a phone number."
};
function getAuthErrorMessage(error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    return ERROR_MAP[code] ?? (error instanceof Error ? error.message : "Something went wrong. Please try again.");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/login/AdminAuthFunnel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminAuthFunnel",
    ()=>AdminAuthFunnel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailPassword$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/emailPassword.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/phone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$passwordReset$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/passwordReset.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/firebase/auth/state.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/login/lib/adminAuth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// ---------------------------------------------------------------------------
// Icons (inline SVG for zero dependencies)
// ---------------------------------------------------------------------------
function ArrowLeftIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M15 10H5M5 10L10 5M5 10L10 15"
        }, void 0, false, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = ArrowLeftIcon;
function MailIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "2",
                y: "4",
                width: "20",
                height: "16",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7"
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c1 = MailIcon;
function PhoneIcon({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"
        }, void 0, false, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 100,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_c2 = PhoneIcon;
// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------
function BackButton({ onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: "mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
        "aria-label": "Go back",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ArrowLeftIcon, {}, void 0, false, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 117,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_c3 = BackButton;
function AuthInput({ id, type = "text", placeholder, value, onChange, autoComplete, autoFocus, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        id: id,
        type: type,
        placeholder: placeholder,
        value: value,
        onChange: (e)=>onChange(e.target.value),
        autoComplete: autoComplete,
        autoFocus: autoFocus,
        disabled: disabled,
        className: "h-12 w-full border-b-2 border-zinc-200 bg-transparent text-base text-foreground placeholder:text-zinc-400 outline-none transition-colors focus:border-primary disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
_c4 = AuthInput;
function PrimaryButton({ children, type = "button", onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        onClick: onClick,
        disabled: disabled,
        className: "flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
        children: children
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_c5 = PrimaryButton;
function MethodButton({ icon, label, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: "flex h-[52px] w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 text-base font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-shrink-0",
                children: icon
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-1 text-center pr-[22px]",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 189,
        columnNumber: 5
    }, this);
}
_c6 = MethodButton;
function ErrorMessage({ message }) {
    if (!message) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-sm text-red-600 dark:text-red-400",
        role: "alert",
        children: message
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
_c7 = ErrorMessage;
function AdminAuthFunnel() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // Step state
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("welcome");
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("signup");
    // Form state
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [confirmPassword, setConfirmPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [otp, setOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Async state
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Phone auth refs
    const confirmationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recaptchaContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recaptchaInitialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // OTP resend cooldown
    const [resendCooldown, setResendCooldown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Redirect already-authed users
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminAuthFunnel.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToAuthState"])({
                "AdminAuthFunnel.useEffect.unsubscribe": async (user)=>{
                    if (user && step === "welcome") {
                        setStep("checking-access");
                        await handlePostAuth(user);
                    }
                }
            }["AdminAuthFunnel.useEffect.unsubscribe"]);
            return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["AdminAuthFunnel.useEffect"], []);
    // Resend cooldown timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminAuthFunnel.useEffect": ()=>{
            if (resendCooldown <= 0) return;
            const timer = setTimeout({
                "AdminAuthFunnel.useEffect.timer": ()=>setResendCooldown({
                        "AdminAuthFunnel.useEffect.timer": (c)=>c - 1
                    }["AdminAuthFunnel.useEffect.timer"])
            }["AdminAuthFunnel.useEffect.timer"], 1000);
            return ({
                "AdminAuthFunnel.useEffect": ()=>clearTimeout(timer)
            })["AdminAuthFunnel.useEffect"];
        }
    }["AdminAuthFunnel.useEffect"], [
        resendCooldown
    ]);
    // ------- Post-auth flow -------
    const handlePostAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AdminAuthFunnel.useCallback[handlePostAuth]": async (user)=>{
            setStep("checking-access");
            setError(null);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upsertUserDoc"])(user);
                const isAdmin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkAdminAccess"])(user.uid);
                if (isAdmin) {
                    const token = await user.getIdToken();
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthCookie"])(token);
                    router.push("/admin");
                } else {
                    setStep("access-denied");
                }
            } catch  {
                setStep("access-denied");
            }
        }
    }["AdminAuthFunnel.useCallback[handlePostAuth]"], [
        router
    ]);
    // ------- Navigation helpers -------
    function goTo(next) {
        setError(null);
        setStep(next);
    }
    function goWelcome() {
        setError(null);
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setStep("welcome");
    }
    // ------- Email sign up -------
    async function handleEmailSignUp(e) {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return setError("Please enter your email.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");
        setLoading(true);
        try {
            const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailPassword$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signUp"])(email, password);
            await handlePostAuth(user);
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Email sign in -------
    async function handleEmailSignIn(e) {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return setError("Please enter your email.");
        if (!password) return setError("Please enter your password.");
        setLoading(true);
        try {
            const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailPassword$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signIn"])(email, password);
            await handlePostAuth(user);
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Phone: send code -------
    async function handleSendPhoneCode(e) {
        e.preventDefault();
        setError(null);
        if (!phone.trim()) return setError("Please enter your phone number.");
        setLoading(true);
        try {
            if (!recaptchaInitialized.current && recaptchaContainerRef.current) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRecaptchaVerifier"])(recaptchaContainerRef.current, {
                    size: "invisible"
                });
                recaptchaInitialized.current = true;
            }
            const confirmation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendPhoneCode"])(phone);
            confirmationRef.current = confirmation;
            setResendCooldown(60);
            goTo("phone-otp");
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Phone: verify OTP -------
    async function handleVerifyOtp(e) {
        e.preventDefault();
        setError(null);
        if (otp.length < 6) return setError("Please enter the 6-digit code.");
        if (!confirmationRef.current) return setError("Session expired. Please request a new code.");
        setLoading(true);
        try {
            const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["confirmPhoneCode"])(confirmationRef.current, otp);
            await handlePostAuth(user);
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Phone: resend code -------
    async function handleResendCode() {
        if (resendCooldown > 0) return;
        setError(null);
        setLoading(true);
        try {
            recaptchaInitialized.current = false;
            if (recaptchaContainerRef.current) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRecaptchaVerifier"])(recaptchaContainerRef.current, {
                    size: "invisible"
                });
                recaptchaInitialized.current = true;
            }
            const confirmation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$phone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendPhoneCode"])(phone);
            confirmationRef.current = confirmation;
            setResendCooldown(60);
            setOtp("");
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Forgot password -------
    async function handleForgotPassword(e) {
        e.preventDefault();
        setError(null);
        if (!email.trim()) return setError("Please enter your email.");
        setLoading(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$passwordReset$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendPasswordReset"])(email);
            goTo("reset-sent");
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    }
    // ------- Access denied: sign out -------
    async function handleSignOutAndReset() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$login$2f$lib$2f$adminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearAuthCookie"])();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$firebase$2f$auth$2f$emailPassword$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOutUser"])();
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setOtp("");
        goWelcome();
    }
    // =====================================================================
    // RENDER: each step
    // =====================================================================
    // -- Welcome (sign up entry point) --
    if (step === "welcome") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-2xl font-bold",
                        children: "D"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                        lineNumber: 454,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 453,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Dorm AI"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 457,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-center text-base leading-relaxed text-secondary-alt dark:text-zinc-400",
                    children: "Streamline inspections, catch damages early, and manage your properties with ease."
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 459,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex w-full flex-col gap-3 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MethodButton, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MailIcon, {
                                className: "text-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                                lineNumber: 466,
                                columnNumber: 19
                            }, void 0),
                            label: "Sign up with email",
                            onClick: ()=>{
                                setMode("signup");
                                goTo("email-signup");
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 465,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MethodButton, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PhoneIcon, {
                                className: "text-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                                lineNumber: 474,
                                columnNumber: 19
                            }, void 0),
                            label: "Sign up with phone",
                            onClick: ()=>{
                                setMode("signup");
                                goTo("phone-entry");
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 473,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 464,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: [
                        "Already have an account?",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                setMode("login");
                                goTo("login-chooser");
                            },
                            className: "font-semibold text-foreground underline underline-offset-2",
                            children: "Log in"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 485,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 483,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Footer, {}, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 497,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 451,
            columnNumber: 7
        }, this);
    }
    // -- Login chooser --
    if (step === "login-chooser") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: goWelcome
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 506,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Welcome back"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 507,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex w-full flex-col gap-3 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MethodButton, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MailIcon, {
                                className: "text-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                                lineNumber: 511,
                                columnNumber: 19
                            }, void 0),
                            label: "Continue with email",
                            onClick: ()=>goTo("email-login")
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 510,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MethodButton, {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PhoneIcon, {
                                className: "text-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                                lineNumber: 516,
                                columnNumber: 19
                            }, void 0),
                            label: "Continue with phone",
                            onClick: ()=>goTo("phone-entry")
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 515,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 509,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: [
                        "Don't have an account?",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                setMode("signup");
                                goWelcome();
                            },
                            className: "font-semibold text-foreground underline underline-offset-2",
                            children: "Create account"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 524,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 522,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 505,
            columnNumber: 7
        }, this);
    }
    // -- Email sign up --
    if (step === "email-signup") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: goWelcome
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 543,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Sign up with email:"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 544,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEmailSignUp,
                    className: "flex w-full flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "signup-email",
                            type: "email",
                            placeholder: "Email",
                            value: email,
                            onChange: setEmail,
                            autoComplete: "email",
                            autoFocus: true,
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 549,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "signup-password",
                            type: "password",
                            placeholder: "Password",
                            value: password,
                            onChange: setPassword,
                            autoComplete: "new-password",
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 559,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "signup-confirm",
                            type: "password",
                            placeholder: "Confirm password",
                            value: confirmPassword,
                            onChange: setConfirmPassword,
                            autoComplete: "new-password",
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 568,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorMessage, {
                            message: error
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 577,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                            type: "submit",
                            disabled: loading,
                            children: loading ? "Creating account…" : "Sign up"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 578,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 548,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: [
                        "Already have an account?",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>goTo("login-chooser"),
                            className: "font-semibold text-foreground underline underline-offset-2",
                            children: "Log in"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 585,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 583,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 542,
            columnNumber: 7
        }, this);
    }
    // -- Email login --
    if (step === "email-login") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: ()=>goTo("login-chooser")
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 601,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Continue with email:"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 602,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEmailSignIn,
                    className: "flex w-full flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "login-email",
                            type: "email",
                            placeholder: "Email",
                            value: email,
                            onChange: setEmail,
                            autoComplete: "email",
                            autoFocus: true,
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 607,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "login-password",
                            type: "password",
                            placeholder: "Password",
                            value: password,
                            onChange: setPassword,
                            autoComplete: "current-password",
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 617,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorMessage, {
                            message: error
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 626,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                            type: "submit",
                            disabled: loading,
                            children: loading ? "Logging in…" : "Log in"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 627,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 606,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>goTo("forgot-password"),
                    className: "text-sm font-semibold text-foreground",
                    children: "Forgot password?"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 632,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 600,
            columnNumber: 7
        }, this);
    }
    // -- Phone entry --
    if (step === "phone-entry") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: ()=>goTo(mode === "login" ? "login-chooser" : "welcome")
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 647,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Continue with phone:"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 652,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: "We'll send a verification code to your number."
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 655,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSendPhoneCode,
                    className: "flex w-full flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "phone-number",
                            type: "tel",
                            placeholder: "+1 (555) 000-0000",
                            value: phone,
                            onChange: setPhone,
                            autoComplete: "tel",
                            autoFocus: true,
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 663,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorMessage, {
                            message: error
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 673,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                            type: "submit",
                            disabled: loading,
                            children: loading ? "Sending code…" : "Send code"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 674,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 659,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: recaptchaContainerRef
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 679,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 646,
            columnNumber: 7
        }, this);
    }
    // -- Phone OTP --
    if (step === "phone-otp") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: ()=>goTo("phone-entry")
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 688,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Enter verification code"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 689,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: [
                        "We sent a 6-digit code to ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium text-foreground",
                            children: phone
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 693,
                            columnNumber: 37
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 692,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleVerifyOtp,
                    className: "flex w-full flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "otp-code",
                            type: "text",
                            placeholder: "000000",
                            value: otp,
                            onChange: (v)=>setOtp(v.replace(/\D/g, "").slice(0, 6)),
                            autoComplete: "one-time-code",
                            autoFocus: true,
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 700,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorMessage, {
                            message: error
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 710,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                            type: "submit",
                            disabled: loading || otp.length < 6,
                            children: loading ? "Verifying…" : "Verify"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 711,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 696,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: handleResendCode,
                    disabled: resendCooldown > 0 || loading,
                    className: "text-sm font-medium text-zinc-500 disabled:opacity-50 dark:text-zinc-400",
                    children: resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 716,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: recaptchaContainerRef
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 727,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 687,
            columnNumber: 7
        }, this);
    }
    // -- Forgot password --
    if (step === "forgot-password") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackButton, {
                    onClick: ()=>goTo("email-login")
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 736,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Reset password"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 737,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-zinc-500 dark:text-zinc-400",
                    children: "We'll confirm your account by sending a link to the email address below."
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 738,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleForgotPassword,
                    className: "flex w-full flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInput, {
                            id: "reset-email",
                            type: "email",
                            placeholder: "Email",
                            value: email,
                            onChange: setEmail,
                            autoComplete: "email",
                            autoFocus: true,
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 747,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorMessage, {
                            message: error
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 757,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                            type: "submit",
                            disabled: loading,
                            children: loading ? "Sending…" : "Send link"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 758,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 743,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 735,
            columnNumber: 7
        }, this);
    }
    // -- Reset sent --
    if (step === "reset-sent") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Check your email"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 770,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-center text-sm text-zinc-500 dark:text-zinc-400",
                    children: [
                        "We sent a password reset link to",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium text-foreground",
                            children: email
                        }, void 0, false, {
                            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                            lineNumber: 775,
                            columnNumber: 11
                        }, this),
                        ". Check your inbox and follow the link to reset your password."
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 773,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                    onClick: ()=>goTo("email-login"),
                    children: "Back to log in"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 778,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 769,
            columnNumber: 7
        }, this);
    }
    // -- Checking access (loading) --
    if (step === "checking-access") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-4 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary dark:border-zinc-700 dark:border-t-white"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                        lineNumber: 790,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-zinc-500 dark:text-zinc-400",
                        children: "Verifying access…"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                        lineNumber: 791,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 789,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 788,
            columnNumber: 7
        }, this);
    }
    // -- Access denied --
    if (step === "access-denied") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Shell, {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold tracking-tight",
                    children: "Access denied"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 803,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-center text-sm text-zinc-500 dark:text-zinc-400",
                    children: "Your account doesn't have admin access. Contact your administrator to get the ADMIN role assigned to your account."
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 804,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrimaryButton, {
                    onClick: handleSignOutAndReset,
                    children: "Sign out"
                }, void 0, false, {
                    fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                    lineNumber: 808,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 802,
            columnNumber: 7
        }, this);
    }
    return null;
}
_s(AdminAuthFunnel, "0ylDO42kvbbgCHXc/v3ogSfWt2k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c8 = AdminAuthFunnel;
// ---------------------------------------------------------------------------
// Layout shell
// ---------------------------------------------------------------------------
function Shell({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-[100dvh] items-center justify-center bg-white px-6 py-12 dark:bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex w-full max-w-[420px] flex-col items-start gap-5",
            children: children
        }, void 0, false, {
            fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
            lineNumber: 825,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 824,
        columnNumber: 5
    }, this);
}
_c9 = Shell;
function Footer() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "pt-4 text-center text-xs text-zinc-400 dark:text-zinc-500 w-full",
        children: [
            "By using Dorm AI, you agree to our",
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: "/terms",
                className: "underline underline-offset-2",
                children: "Terms of Use"
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 836,
                columnNumber: 7
            }, this),
            " ",
            "and",
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: "/privacy",
                className: "underline underline-offset-2",
                children: "Privacy Policy"
            }, void 0, false, {
                fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
                lineNumber: 840,
                columnNumber: 7
            }, this),
            "."
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/login/AdminAuthFunnel.tsx",
        lineNumber: 834,
        columnNumber: 5
    }, this);
}
_c10 = Footer;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10;
__turbopack_context__.k.register(_c, "ArrowLeftIcon");
__turbopack_context__.k.register(_c1, "MailIcon");
__turbopack_context__.k.register(_c2, "PhoneIcon");
__turbopack_context__.k.register(_c3, "BackButton");
__turbopack_context__.k.register(_c4, "AuthInput");
__turbopack_context__.k.register(_c5, "PrimaryButton");
__turbopack_context__.k.register(_c6, "MethodButton");
__turbopack_context__.k.register(_c7, "ErrorMessage");
__turbopack_context__.k.register(_c8, "AdminAuthFunnel");
__turbopack_context__.k.register(_c9, "Shell");
__turbopack_context__.k.register(_c10, "Footer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_b7d53ae6._.js.map