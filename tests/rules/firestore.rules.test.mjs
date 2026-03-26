import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "dorm-ai-rules-test",
    firestore: {
      rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

after(async () => {
  await testEnv.cleanup();
});

test("unauthenticated users cannot read inspections", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "inspections", "insp-1"), {
      organizationId: "uni-1",
      inspectorId: "insp-user",
      tenantIds: ["tenant-1"],
      status: "SCHEDULED",
    });
  });

  const anonDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonDb, "inspections", "insp-1")));
});

test("tenant assigned to inspection can read it", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "inspections", "insp-2"), {
      organizationId: "uni-1",
      inspectorId: "insp-user",
      tenantIds: ["tenant-1"],
      status: "SCHEDULED",
    });
  });

  const tenantDb = testEnv.authenticatedContext("tenant-1").firestore();
  const snap = await assertSucceeds(getDoc(doc(tenantDb, "inspections", "insp-2")));
  assert.equal(snap.exists(), true);
});

test("unrelated users cannot read inspections", async () => {
  const strangerDb = testEnv.authenticatedContext("stranger-user").firestore();
  await assertFails(getDoc(doc(strangerDb, "inspections", "insp-2")));
});
