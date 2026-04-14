# CSCI 387 — Testing Plan Source Material (Dorm AI / Inspect AI)

**Purpose of this document:** This is **raw, dense technical material** aligned with the **Milestone 3 Testing Plan rubric** and the **Dorm AI** codebase. It is intentionally long. You can paste sections (or the whole file) into another tool to produce a **polished, submission-ready Testing Plan** with appropriate tone (professional, clear headings, consistent terminology).

**Product names in the UI/docs:** The app is referred to in places as **Inspect AI** (e.g. legal pages metadata) while the repository is **Dorm AI**. Use one name consistently in your final document unless your instructor prefers the course project name only.

---

## Part A — Rubric alignment (what the instructor is grading)

Below is the **structure implied by the rubric** (Introduction, Test Items, Strategy, Environment & Resources, Deliverables & Schedule, Formatting). Map every paragraph of your final PDF/DOCX to one of these buckets so you do not lose points.

### A.1 Introduction — Purpose & Goals (example: 10 points)

**What “good” looks like (conceptually):**

- States **why** testing exists: reduce defects before release, protect users, validate requirements, support regression safety as the team iterates.
- Names the **system under test (SUT)** clearly: a **Next.js** web application with **Firebase** (Auth, Firestore, Storage), **role-based portals** (admin, inspector, tenant), and supporting **API routes** and **Cloud Functions**.
- Optionally states **release context**: e.g. course milestone, demo deployment, or pilot—enough that a reader knows this is not a toy script but a multi-surface product.

**Phrases you can adapt (not copy verbatim if your school checks originality):**

- “The purpose of this testing plan is to define how we will verify that Dorm AI behaves correctly for each user role, that security boundaries hold (session and organization scoping), and that critical workflows remain stable across iterations.”
- “Success means we can demonstrate repeatable evidence (test cases, runs, defects) for core flows and known edge cases, not only ‘it worked on my laptop once.’”

---

### A.2 Test Items — Features To Be Tested (example: 10 points)

**What “good” looks like:**

- A **comprehensive list** of functionalities: not one vague sentence like “we will test the app,” but **grouped capabilities** (auth, admin CRUD, portals, APIs, etc.).
- Each item should be something a tester could **recognize in the UI or API** (e.g. “admin can create a building,” “unauthenticated user cannot open admin console without login”).

This source document’s **Part C** is your feature backlog for this section.

---

### A.3 Test Items — Features Not To Be Tested (example: 10 points)

**What “good” looks like:**

- Explicit **out-of-scope** list with **reason** (third-party SLA, not implemented, deferred, owned by vendor).
- Typical defensible exclusions for a student Firebase project:

  - **Google / Firebase infrastructure uptime** (you test *your* integration, not Google’s global availability).
  - **Email deliverability to arbitrary inboxes** (you may test that *your app requests* an email send and handles API errors; you do not guarantee inbox placement).
  - **Third-party AI model behavior** beyond contract (if you call an LLM for summaries: you test request/response handling, timeouts, and permission errors—not the model’s factual correctness about the world).
  - **Load / stress testing** at production scale (unless explicitly required).
  - **Accessibility audit to WCAG AAA** (unless required—otherwise scope to “critical paths keyboard navigable” or defer).

This source document’s **Part D** expands exclusions with rationale.

---

### A.4 Test Strategy & Approach — Testing Types (example: 10 points)

**What “good” looks like:**

- For **each major feature group**, name **which test levels** apply:

  - **Unit tests:** pure logic (validation, CSV parsing, URL builders, RBAC helpers).
  - **Integration tests:** API route + mocked or emulated backend; or Firestore rules tests against emulator.
  - **End-to-end (E2E) tests:** browser automation (e.g. Playwright) against a running Next server—validates routing, redirects, visible UI.
  - **Manual / exploratory:** complex UI, one-off edge cases, visual/layout issues, device-specific quirks.
  - **Security-oriented testing:** session cookies, role redirects (often covered by E2E + rules tests together).

- Avoid claiming “we only unit test everything” if the rubric expects a **mix**; the bookstore example used **Unit Testing** per feature—your project can similarly assign **primary** level per feature while mentioning supporting levels.

---

### A.5 Test Strategy & Approach — Pass/Fail Criteria (example: 10 points)

**What “good” looks like:**

- **Pass criteria** are **observable** (“after saving, the building appears in the list with correct code”).
- **Fail criteria** where useful (example rubric style: “after delete, item still visible” as failure condition).
- Criteria should be **tester-executable**: a person without code knowledge can often decide pass/fail from the description.

This source document’s **Part E** lists many concrete pass/fail examples you can select from.

---

### A.6 Environment & Resources — Hardware / Software (example: 10 points)

**What “good” looks like:**

- **Client:** supported browsers (at least Chrome; optionally Safari/Firefox/Edge), desktop vs mobile if relevant.
- **Server/runtime:** Node.js version consistent with the project, Next.js build.
- **Backend:** Firebase project (Auth, Firestore, Storage), optional **Firebase Emulator Suite** for isolated testing.
- **Tools:** IDE, Git, package manager (npm), test runners (Vitest, Playwright), Firebase CLI for emulators, optional CI (GitHub Actions, etc.).

This source document’s **Part F** lists concrete tools as implemented in-repo.

---

### A.7 Environment & Resources — Staffing & Roles (example: 5 points)

**What “good” looks like:**

- Clear **who** writes code, **who** executes tests, **who** triages failures (even in a small team: “Developer A,” “QA/Tester,” “PM”—roles can map to the same people in a 3-person group).

---

### A.8 Environment & Resources — Test Data (example: 10 points)

**What “good” looks like:**

- Describes **seed data**: organizations, properties, buildings, rooms, users per role, invite codes.
- Describes **negative data**: invalid CSV rows, wrong account for invite link, expired or malformed codes (where applicable).
- Mentions **PII/safety**: use synthetic emails, no real student data in reports.

This source document’s **Part G** suggests datasets.

---

### A.9 Deliverables & Schedule — Artifacts (example: 5 points)

**Typical artifacts:**

- Test plan (this assignment).
- Test cases (matrix or checklist).
- Test execution logs / summary.
- Defect reports (title, steps, severity, status).
- Coverage notes (what automation exists: unit/E2E/rules).

**Repo-specific:** Vitest unit tests under `tests/unit/`, Playwright under `tests/e2e/`, Firestore rules tests under `tests/rules/`.

---

### A.10 Deliverables & Schedule — Timeline (example: 5 points)

**What “good” looks like:**

- Testing activities **aligned to milestones** (development sprints, integration week, hardening week).
- If the course has fixed due dates, show **parallel** test activities with development (the example plan did this).

---

### A.11 Deliverables & Schedule — Risks (example: 5 points)

**What “good” looks like:**

- Identifies **blockers**: Firebase quota, flaky E2E, missing test accounts, scope creep.
- **Contingencies:** prioritize smoke tests, add retries, use emulator, reduce parallel work.

---

### A.12 Formatting & Professionalism (example: 10 points total)

- **Organization:** numbered sections, consistent headings, table of contents if long.
- **Mechanics:** spelling/grammar, neutral professional tone, define acronyms once (SUT, E2E, RBAC, NANP for phone rules, etc.).

---

## Part B — System under test (technical overview for your Introduction)

### B.1 Architecture (high level)

- **Frontend:** Next.js **App Router** (`app/` directory), React 19, TypeScript, Tailwind CSS.
- **Authentication:** Firebase Authentication; session bridged via HTTP-only **session cookie** (`__session`) and API routes such as `/api/auth/session`, `/api/auth/redirect-path`.
- **Data:** **Firestore** for organizations, memberships, properties, buildings, rooms, inspections, etc. (see project data model docs).
- **Files:** **Firebase Storage** for uploads where implemented.
- **Serverless:** Firebase **Cloud Functions** (e.g. checklist creation trigger in `functions/`).
- **Email:** outbound email via **Resend** (or similar) from API routes under `app/api/email/`.
- **AI (optional feature area):** inspection summary generation via API route under `app/api/inspections/[inspectionId]/summary` and service code in `app/lib/ai/`.

### B.2 User roles and surfaces

1. **Unauthenticated visitor:** landing page, signup/login, legal pages, join flows.
2. **Authenticated user (home / onboarding):** property setup, organization membership, routing to correct “home” or funnel.
3. **Admin (organization-scoped):** console under `/admin/*` with `organizationId` query parameter for org-scoped screens (buildings, rooms, inspectors, tenants, inspections, scheduling, settings).
4. **Inspector:** `/inspector` execution and related UI.
5. **Tenant:** `/tenant` and inspection detail views.
6. **Manager (per-organization):** `/manager/[organizationId]` dashboard pattern.

### B.3 Cross-cutting security & routing

- **`middleware.ts`** enforces:

  - Unauthenticated users hitting protected **admin** routes → redirect to **`/admin/login`** with `next` query for return path.
  - Admin routes (beyond login) require **`organizationId`** query param; missing org context may redirect to **`/home/dashboard`**.
  - Admin access for a given org is verified via **`/api/auth/verify-admin-org`** (active ADMIN membership).
  - **Tenant** and **inspector** routes require session; wrong role may redirect via **`/api/auth/redirect-path`** logic.
  - **Inspectors/tenants** must not use the admin console; middleware redirects them toward their portal when applicable.
  - Public paths include `/`, `/signup`, `/login`, `/forgot-password`, `/join`, `/setup-funnel`, `/home` (with special case: `/home` without session may redirect to signup).

Understanding this layer is essential for **security/regression testing** and for writing **E2E assertions** on redirects.

---

## Part C — Features to test (comprehensive backlog)

Organize your final document by **epic → features → test ideas**. Below is **raw inventory** you can prune.

### C.1 Public marketing & legal

| ID | Feature | Notes / routes |
|----|---------|----------------|
| P1 | Landing page content and CTAs | `/` — hero, “Get started” or equivalent links |
| P2 | Terms of Use (sample) | `/terms` — heading, “demo only” disclaimer visibility |
| P3 | Privacy Policy (sample) | `/privacy` — heading, demo disclaimer |

**Pass criteria examples:**

- P1: Primary CTA navigates to signup (or documented entry point) without console errors.
- P2–P3: Page returns success; key headings visible; back/home link works.

---

### C.2 Authentication & session

| ID | Feature | Notes |
|----|---------|-------|
| A1 | Email/password signup | `/signup`, funnel steps |
| A2 | Email/password login | `/login` |
| A3 | Password reset | `/forgot-password` |
| A4 | Phone auth steps (if enabled in funnel) | components under `components/auth/` |
| A5 | Session establishment | POST `/api/auth/session`, cookie `__session` present when logged in |
| A6 | Redirect after login | GET `/api/auth/redirect-path` drives role-appropriate destination |
| A7 | Email check (availability / validation) | `/api/auth/check-email` |

**Fail / edge examples:**

- Invalid email format shows validation message (client and/or server behavior per implementation).
- Wrong password shows generic “invalid credentials” style message (avoid account enumeration in descriptions if that is the design).

---

### C.3 Home, onboarding, property creation

| ID | Feature | Routes |
|----|---------|--------|
| H1 | Home entry | `/home` — unauthenticated redirect behavior per middleware |
| H2 | Home dashboard | `/home/dashboard` |
| H3 | New property | `/home/new-property` |
| H4 | Setup funnel | `/setup-funnel` |

**Integration note:** These flows are **Firestore-heavy**; reliable automation may require **emulator** or **dedicated test project**.

---

### C.4 Invitations & membership

| ID | Feature | Routes / modules |
|----|---------|------------------|
| I1 | Join landing | `/join` |
| I2 | Join with invite code | `/join/[code]` |
| I3 | Join invite API | `/api/auth/join-invite` |
| I4 | Membership invite email | `/api/email/membership-invite` |
| I5 | Welcome email | `/api/email/welcome` |
| I6 | Organization created email | `/api/email/organization-created` |
| I7 | Bulk CSV invite parsing | `lib/csv/parseInviteCsv.ts`, admin UI cards |

**Pass criteria examples:**

- Valid invite code path loads; email query parameter `e=` preserved when designed for prefill.
- CSV parsing extracts tenant vs inspector rows; invalid emails flagged with row numbers in errors.

---

### C.5 Admin console (organization-scoped)

**Query pattern:** Most admin pages expect `?organizationId=<id>` (see `lib/admin/adminOrgQuery.ts` helper `withAdminOrganizationId`).

| ID | Feature | Route |
|----|---------|-------|
| ADM0 | Admin entry / org picker | `/admin`, related client components |
| ADM1 | Admin login | `/admin/login` |
| ADM2 | Dashboard | `/admin/dashboard` |
| ADM3 | Settings | `/admin/settings` |
| ADM4 | Buildings CRUD + CSV import | `/admin/buildings` |
| ADM5 | Rooms CRUD | `/admin/rooms` |
| ADM6 | Inspectors lifecycle | `/admin/inspectors`, `/admin/inspectors/[inspectorId]` |
| ADM7 | Tenants | `/admin/tenants`, `/admin/tenants/[tenantId]` |
| ADM8 | Inspections list | `/admin/inspections` |
| ADM9 | Inspection detail | `/admin/inspections/[inspectionId]` |
| ADM10 | Schedule inspection | `/admin/inspections/schedule` |

**Pass criteria examples:**

- **Create:** entity appears in list with correct fields.
- **Update:** changes persist after refresh/navigation.
- **Delete:** entity removed; dependent UI updates (where applicable).
- **CSV:** valid file imports expected rows; invalid file surfaces row-level issues without crashing.

**Fail criteria examples:**

- Duplicate building codes skipped or reported per CSV parser rules.
- Missing `organizationId` redirects away from deep admin pages (per middleware).

---

### C.6 Inspector portal

| ID | Feature | Route |
|----|---------|-------|
| IN1 | Inspector shell / auth gate | `/inspector`, layout |
| IN2 | Execution / runtime client | `InspectorExecutionClient` and related |

**Security tests:**

- Inspector session cannot browse `/admin/...` (middleware + redirect-path behavior).

---

### C.7 Tenant portal

| ID | Feature | Route |
|----|---------|-------|
| T1 | Tenant home | `/tenant` |
| T2 | Inspection detail | `/tenant/inspections/[inspectionId]` |

**Security tests:**

- Tenant cannot access admin routes.

---

### C.8 Manager dashboard

| ID | Feature | Route |
|----|---------|-------|
| M1 | Per-organization manager view | `/manager/[organizationId]` |

---

### C.9 Account & settings

| ID | Feature | Route |
|----|---------|-------|
| AC1 | Account | `/account` |
| AC2 | Settings | `/settings` |

---

### C.10 API routes (service behavior)

| Route | Purpose |
|-------|---------|
| `/api/auth/session` | Create/clear session cookie bridge |
| `/api/auth/redirect-path` | Role-based navigation target |
| `/api/auth/check-email` | Email validation/existence checks |
| `/api/auth/join-invite` | Invite redemption logic |
| `/api/auth/verify-admin-org` | Validates active admin membership for org |
| `/api/email/welcome` | Welcome email trigger |
| `/api/email/membership-invite` | Membership invite email |
| `/api/email/organization-created` | Org creation notification |
| `/api/inspections/[inspectionId]/summary` | AI summary generation |

**Testing approach:**

- **Unit:** request validation, error mapping, pure helpers.
- **Integration:** call handlers with mocked Firebase Admin / mocked fetch—if implemented in the course timeline.
- **E2E:** only where necessary; prefer fast lower-level tests for APIs.

---

### C.11 Backend & rules

| Area | Testing idea |
|------|----------------|
| Firestore security rules | Emulator tests: deny unauthenticated reads; role-scoped access patterns (`tests/rules/firestore.rules.test.mjs`) |
| Cloud Function triggers | Verify function runs on document creation (logs / test harness) |
| Storage rules | Upload/download/delete permissions per role (if in scope) |

---

### C.12 Automated tests already in the repository (ground truth for “as-built”)

| Suite | Location | Role |
|-------|----------|------|
| Unit | `tests/unit/**/*.test.ts` | Vitest — validation, CSV, phone, RBAC, portal URL builders, HTML escape, map geometry, middleware helpers, join links (mocked origin) |
| E2E | `tests/e2e/*.spec.ts` | Playwright — golden path, public pages, admin unauthenticated gate |
| Rules | `tests/rules/firestore.rules.test.mjs` | Emulator + `@firebase/rules-unit-testing` |

Your **Testing Plan** can reference these as **evidence of regression automation** without pasting code.

---

## Part D — Features NOT to test (explicit out-of-scope suggestions)

Use a table like this in your final write-up:

| Exclusion | Rationale |
|-----------|-----------|
| Google Cloud / Firebase regional outages | Outside team control; monitor status pages |
| Third-party email inbox placement / spam scoring | Test app-side send request + error handling only |
| LLM factual accuracy for open-ended summaries | Test API contracts, authz, and failure modes; “correct English” is subjective unless spec defines templates |
| WCAG 2.2 AAA full audit | Unless course requires; scope to critical flows or defer |
| Performance at 10k+ concurrent users | Out of scope for class project unless specified |
| Penetration testing by external firm | Not in student budget/timebox |
| Legacy browser support (IE11) | Unless explicitly required |

**Optional nuanced exclusion:** “Firebase Authentication internal password hashing” — you test **your app’s use** of Auth, not Google’s crypto implementation.

---

## Part E — Pass / fail criteria library (copy/adapt)

### E.1 Global

- **Pass:** Action completes; persisted state matches UI; no unhandled error boundary; user receives clear feedback (toast/message).
- **Fail:** Data loss silent failure; wrong role can access another org’s data; 500 error with no recovery path.

### E.2 Session / middleware

- **Pass (unauthenticated admin deep link):** Browser ends on `/admin/login` and `next` parameter preserves intended path.
- **Pass (authenticated wrong role):** User redirected away from forbidden surface (e.g. inspector not in admin console).
- **Fail:** Admin page renders without org context when org is required (should redirect or show blocking error—per product rules).

### E.3 CSV imports

- **Pass:** Valid rows imported; duplicates reported; partial success documented in issues array.
- **Fail:** Parser throws uncaught exception on malformed file; duplicate rows silently overwrite without notice (if not intended).

### E.4 Phone numbers (US NANP helpers)

- **Pass:** Valid 10-digit NANP passes `isValidNanp10` rules used in app (area/exchange cannot start with 0 or 1).
- **Fail:** Display format inconsistent with stored E.164 conversion.

---

## Part F — Environments, tools, and configuration

### F.1 Developer workstation

- **OS:** macOS / Windows / Linux (note any OS-specific issue you observed, e.g. case sensitivity).
- **Node.js:** Align with `package.json` / course lab version.
- **Browser:** Chrome latest for E2E; manual spot-check Safari if targeting iOS users.

### F.2 Runtime stack

- **Next.js** dev server (example: port **3005** in Playwright config—your final doc should use whatever the team standardizes).
- **Environment variables:** `NEXT_PUBLIC_*` for Firebase client config; secrets for server routes (Resend, service accounts)—**never commit** secrets; describe *that* they exist.

### F.3 Firebase

- **Auth:** Email/password, phone if used.
- **Firestore:** Primary database.
- **Storage:** File metadata and URLs.
- **Emulators:** Auth, Firestore, Functions (optional but recommended for repeatable CI).

### F.4 Test tooling (as implemented)

- **Vitest** for unit tests.
- **Playwright** for E2E.
- **Firebase emulator** for rules tests via `firebase emulators:exec`.

### F.5 CI / repeatability (recommended wording)

- “Tests should be runnable from clean checkout with documented env templates.”
- “E2E may require `npx playwright install` once per machine.”

---

## Part G — Test data design (examples)

### G.1 Users

| Role | Purpose |
|------|---------|
| `admin@test.local` | Admin membership in Org A |
| `inspector@test.local` | Inspector membership in Org A |
| `tenant@test.local` | Tenant membership in Org A |
| `norole@test.local` | User with no membership — redirect testing |

Use **plus addressing** on a domain you control (e.g. `qa+admin@…`) to reduce inbox clutter.

### G.2 Organizations & IDs

- **Org A:** primary happy path.
- **Org B:** cross-org isolation tests (admin of A cannot manipulate B’s data).

### G.3 Property / building / room

- **Building codes:** `BLDG-A`, `BLDG-B` — test duplicate detection in CSV.
- **Rooms:** numbers vs labels as implemented in admin UI.

### G.4 Inspections

- Scheduled vs completed states (per your `types` and Firestore model).
- Attachments if Storage is in play.

### G.5 Invites

- Valid code vs invalid code vs code for **wrong email account** (middleware comment: join flow may require staying in app for sign-out/switch-account behavior—describe as manual/E2E scenario).

---

## Part H — Roles & responsibilities (template)

| Role | Responsibility |
|------|----------------|
| Developer | Implements features; fixes defects; maintains automated tests |
| QA / Tester | Writes test cases, executes manual + E2E suites, logs defects |
| Tech lead | Prioritizes scope, approves release candidate |
| PM / Instructor liaison | Aligns milestones with course deadlines |

In a small team, one person may wear multiple hats—still **name the hats**.

---

## Part I — Deliverables (what you hand in besides this plan)

1. **Testing Plan document** (the graded artifact).
2. **Test case list** (spreadsheet or appendix): ID, title, steps, expected result, priority.
3. **Traceability matrix (optional but impressive):** requirement → test case IDs.
4. **Automation inventory:** which tests exist in-repo (Vitest/Playwright/Rules).
5. **Defect log template:** ID, severity, steps, screenshot, status.

---

## Part J — Schedule (example narrative)

**Week 1 — Plan & environment:** Finalize scope, set Firebase test project, env templates, smoke checklist.

**Week 2 — Functional testing:** Execute admin CRUD paths per org; log defects.

**Week 3 — Hardening:** Retest fixed defects; expand E2E smoke; run rules tests.

**Week 4 — Release readiness:** Regression pass; test summary report; known issues list.

Adjust dates to your **actual** course calendar.

---

## Part K — Risks & contingencies (expanded)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase quota / billing | Blocks testing | Use emulator; throttle E2E; single shared test project |
| Flaky E2E (timing) | False failures | Increase Playwright timeouts judiciously; await network idle only where needed; retry policy in CI |
| Incomplete test data | Cannot test RBAC | Seed script or manual fixture creation doc |
| Scope creep | Miss deadline | Prioritize P0 smoke vs full matrix |
| AI summary dependency | Non-deterministic | Assert HTTP shape and error handling; avoid asserting exact wording |

---

## Part L — Suspension & resumption (from example plan style)

**Suspension criteria (when you pause testing):**

- Critical defects block navigation (e.g. cannot log in at all).
- Test environment misconfigured (wrong Firebase project, missing API keys).
- External dependency down (Resend outage—if you cannot mock).

**Resumption criteria:**

- Defect resolved or workaround documented.
- Environment restored; smoke test passes.

---

## Part M — Approvals (optional closing section)

“This testing plan is subject to approval by the project stakeholder / product owner / instructor before formal test execution begins.”

(Adjust to your course’s language.)

---

## Part N — Glossary (for user-friendly technical writing)

| Term | Meaning |
|------|---------|
| SUT | System Under Test |
| E2E | End-to-end (full browser stack) |
| RBAC | Role-based access control |
| NANP | North American Numbering Plan (10-digit US phone rules in helpers) |
| E.164 | International phone format (+country…) |
| Emulator | Local Firebase services mimicking cloud behavior |
| Smoke test | Minimal path proving “basically works” |
| Regression | Old feature breaks after new change |

---

## Part O — One-page “executive summary” you can polish last

**Dorm AI** is a multi-role property inspection web application. Testing must cover **authentication**, **role isolation**, **organization-scoped admin operations**, and **portal-specific workflows** for inspectors and tenants. Automated layers include **unit tests** for deterministic logic, **Playwright** for browser smoke, and **Firestore rules tests** for database security. Manual testing remains important for complex forms, CSV edge cases, and email flows. Risks include environment configuration, third-party services, and non-deterministic AI features—each mitigated by clear pass/fail criteria and scoped automation.

---

## Closing note for LLM formatting

When you prompt ChatGPT (or similar), ask it to:

1. Produce **8–15 pages** or whatever your instructor expects.
2. Use **your course cover page / title block** if required.
3. Replace narrative with **your team name, product name, and dates**.
4. Turn **Part C** into a clean **numbered test section** with **tables**, not bullets only.
5. Ensure **Features Not To Be Tested** is clearly labeled (rubric item).
6. Keep **technical accuracy**—do not invent APIs your code does not have; this document is grounded in the repo layout above.

**End of source material.**
