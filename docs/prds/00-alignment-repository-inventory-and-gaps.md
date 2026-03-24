# PRD-00: Repository alignment, inventory, and gap bridge

## Goal
Treat the codebase as already in motion: map what exists today to the master PRD and mini-PRDs, resolve naming and routing drift, and define a single thread of work so new features extend and connect existing modules instead of duplicating them.

## Why this exists
The other mini-PRDs were written from `docs/MASTER-PRD.pdf`. They describe target behavior and delivery slices; they did not originally diff against this repo. This document is the mandatory first pass before treating any work as greenfield.

## Scope
- Inventory major routes, layouts, APIs, and shared libraries.
- Compare against master PRD sitemap (sections 5-6), functional requirements (section 11), and mini-PRDs (`01`-`18`).
- Record gaps, partial implementations, and integration blockers.
- Define decisions for naming/routing drift (admin vs manager, university vs property).
- Produce a prioritized backlog labeled refactor / finish / new.

## Non-goals
- Rewriting the master PRD.
- Implementing features in this document.

## Dependencies
- None.

## Deliverables

### 1) Route and surface inventory (completed pass)

| Path / module | Role(s) | PRD slice(s) | Status | Notes |
|---|---|---|---|---|
| `/` | Public | `02`, `16` | partial | Landing implemented; PRD pages `/privacy-policy` and `/terms-of-use` are missing. |
| `/signup` + `app/signup/AuthFunnel.tsx` | Public/Auth | `02` | partial | Email signup/login + reset implemented; PRD expects explicit `/login` and `/forgot-password` routes (currently step-based query flow). |
| `/setup-funnel` + `app/setup-funnel/SetupFunnel.tsx` | Shared onboarding | `02`, `03` | partial | Writes `users.role` and profile data; not membership-driven onboarding by org/invite. |
| `/home` + `components/auth/SessionCookieSync.tsx` | Shared redirect | `02`, `03` | partial | Role redirect exists via `__session`; auth story split between generic and admin funnels. |
| `/home/new-property` + `app/home/new-property/NewPropertyForm.tsx` | Admin | `03`, `04`, `05` | partial | Creates university + admin membership; redirects to non-scoped `/admin/dashboard`. |
| `/admin` | Admin | `05` | partial | Organization selector is static mock cards, no live org membership list. |
| `/admin/dashboard` | Admin | `05` | partial | Full shell/wireframe with static metrics and placeholders. |
| `/admin/buildings` | Admin | `04` | partial | UI table only; all actions disabled. |
| `/admin/rooms` | Admin | `04` | partial | UI table only; search/actions disabled. |
| `/admin/tenants`, `/admin/tenants/[tenantId]` | Admin | `06` | partial | List/detail stubs with static data; actions mostly disabled. |
| `/admin/inspectors`, `/admin/inspectors/[inspectorId]` | Admin | `06` | partial | List/detail stubs with static data; no invite/assignment wiring. |
| `/admin/inspections`, `/admin/inspections/schedule`, `/admin/inspections/[inspectionId]` | Admin | `07`, `10`, `12`, `13` | partial | Endpoints/screens exist but mostly placeholder data and disabled controls. |
| `/tenant` | Tenant | `09`, `16` | partial | Empty-state UX exists; no dedicated `/tenant/inbox`, `/tenant/inspections/[id]`, etc. |
| `/inspector` + `app/inspector/layout.tsx` | Inspector | `08`, `12`, `16` | partial | Rich single-page wireframe runner; state is local in-memory, no Firestore persistence. |
| `/manager/[universityId]` | Admin/Manager | `05` | partial | Exists but "coming next"; route name conflicts with PRD admin-university URL strategy. |
| `app/api/auth/session/route.ts` | Shared auth | `02`, `03`, `14` | partial | Creates `__session` from Firebase ID token (good base). |
| `app/api/auth/redirect-path/route.ts` | Shared auth | `02`, `03` | partial | Redirects by user role from Firestore user doc. |
| `app/api/auth/check-email/route.ts` | Shared auth | `02`, `11` | partial | Email existence lookup present. |
| `middleware.ts` | Shared auth guard | `02`, `03`, `14` | partial | Guards `/admin*` and public redirects; does not enforce role-specific tenant/inspector paths consistently. |
| `app/lib/firebase/*` | Shared infra | `01`, `03`, `04`, `12`, `13` | partial | App/admin/auth/firestore/storage helpers exist and are usable. |
| `types/dorm.ts` | Shared domain model | `01`, `03`, `04`, `07`, `12`, `13` | partial | Good normalized types; runtime flows do not yet fully honor these models. |

### 2) Shared infrastructure inventory (completed pass)

- Firebase core is present: `app/lib/firebase/app.ts`, `app/lib/firebase/admin.ts`, auth/firestore/storage helper modules.
- Collections constants align with master PRD entities: `users`, `universities`, `memberships`, `buildings`, `rooms`, `inspections`, `inspectionItems`, `media`, `charges`, plus `inviteCodes`.
- API auth routes exist (`session`, `redirect-path`, `check-email`), but route and cookie behavior should be unified around one canonical flow.
- No Firestore/Storage security rules files were found in repo root (`firestore.rules`, `storage.rules` absent in this pass).

### 3) PRD to code mapping (`01`-`18`)

| Mini-PRD | Covered by existing code (where) | Missing or stubbed | Conflict and decision |
|---|---|---|---|
| `01-platform-foundation-architecture` | Next.js App Router, Firebase modules, shared types | Domain/service boundaries are still mixed in UI pages | Keep existing Firebase foundation; refactor incrementally, do not rebuild stack |
| `02-authentication-account-lifecycle` | Signup/login/reset flows, setup funnel, session cookie sync, redirect API | Invite/join as first-class route, explicit login/forgot pages, robust account lifecycle states | Keep step-based auth initially; document route aliases instead of immediate path churn |
| `03-organization-membership-rbac` | Membership collection exists; admin check helper exists | Strong RBAC enforcement by org and role is incomplete in UI/routes | Move to membership-driven authorization as source of truth |
| `04-building-room-domain-model` | Types + collection constants + buildings/rooms pages | CRUD and validation logic mostly disabled | Wire pages to Firestore using existing helpers |
| `05-admin-dashboard-navigation` | Admin layout and dashboard shell implemented | Org switcher/search/notifications are placeholders | Keep `/admin/*` shell; phase in org-scoped data |
| `06-admin-user-management-tenants-inspectors` | Tenant/inspector list/detail screens exist | Invite lifecycle, status changes, assignments mostly disabled | Use existing pages, avoid creating parallel routes |
| `07-inspection-scheduling-oversight` | Admin inspections list/schedule/detail pages | Scheduling write-path and status transitions not wired | Keep current routes; implement state machine + persistence |
| `08-inspector-workflow-execution` | Strong inspector runner UX under `/inspector` | In-memory only, no assignment enforcement/persistence | Keep single-page runner for now; map to backend state model |
| `09-tenant-transparency-experience` | Tenant home and empty-state UX | Dedicated inbox/list/detail pages and evidence views missing | Build subroutes or tab states without duplicating tenant shell |
| `10-ai-summary-generation-human-review` | Placeholder on admin/inspector review views | Vertex integration, summary draft/review lifecycle missing | Implement behind backend function and review gates |
| `11-notifications-email-eventing` | Basic auth email reset path checks | Event pipeline + templates + delivery logs missing | Add event-driven service; avoid UI-only mock notifications |
| `12-media-upload-evidence-management` | Storage helper modules + inspector file input UI | Persistent upload path, metadata linkage, authorization missing | Reuse storage helpers; add evidence domain writes |
| `13-audit-logging-data-integrity` | Timestamp fields in types and some writes | Dedicated audit log/events, drift checks, repair scripts missing | Add append-only audit model before launch |
| `14-security-privacy-compliance` | Middleware + session cookie infrastructure | Security rules/tests and strict role/org enforcement missing | Prioritize rules and test suite before feature expansion |
| `15-performance-reliability-observability` | Basic architecture supports extension | No structured logging/metrics/retries/load checks | Add operational baseline in parallel with core flows |
| `16-ui-design-system-empty-states` | Good visual language and empty-state scaffolding | Consistency gaps across role portals and route depth | Keep current component style; normalize shared primitives |
| `17-testing-qa-release-readiness` | None notable as automated suite in this pass | No robust E2E/integration coverage for golden flow | Add tests before final integration freeze |
| `18-deployment-vercel-firebase-ops` | Environment-aware Firebase admin/client setup exists | Deploy/runbook, smoke scripts, rollback discipline not documented in code | Create explicit ops runbook and CI checks |

### 4) Roadmap coverage snapshot (top-level)

- Phase 1 (foundation/guardrails): partial (`app/lib/firebase/*`, `types/dorm.ts`, `middleware.ts`).
- Phase 2 (identity/access): partial (`signup`, `setup-funnel`, auth APIs); RBAC not complete.
- Phase 3 (core admin): partial (admin pages mostly wired as UI scaffolds).
- Phase 4 (inspection lifecycle): partial (screens exist; persistence/state-machine missing).
- Phase 5 (tenant trust/notifications): tenant empty-state exists; notifications mostly not started.
- Phase 6 (AI/integrity): mostly not started (placeholders only).
- Phase 7 (finish/launch): mostly not started (testing + ops hardening).

### 5) Tie-together checklist (answered)

1. **Single source of truth for inspections and room assignment**
   - Current: mixed (wireframe/local state on inspector page, mock rows on admin pages).
   - Decision: Firestore `inspections` + `inspectionItems` + `media` become canonical; UI state mirrors server state only.

2. **One auth story**
   - Current: two funnels and mixed cookie concepts (`__session` plus legacy `admin-session` helper usage).
   - Decision: standardize on `__session` flow and role/membership redirect service; remove legacy cookie assumptions.

3. **No duplicate domain logic**
   - Current: entity behavior spread across page-level local arrays and helper modules.
   - Decision: move entity operations into shared domain/service modules, keep pages thin.

4. **Naming consistency (admin/manager, university/property)**
   - Current: both `manager/[universityId]` and `/admin/*`, plus UI copy using "property".
   - Decision: treat `universityId` as canonical data scope, retain "property" as UX copy only, and converge route strategy toward `/admin/[universityId]/...` through staged migration (or explicitly keep `/admin/*` + active org context if migration cost is too high).

5. **End-to-end smoke path**
   - Target golden path: admin creates org/building/room -> schedules inspection -> inspector executes/submits with media -> tenant views report.
   - Current blockers: disabled admin CRUD/scheduling actions, no persisted inspector execution, no tenant report detail view, no unified status transitions.

### 6) Prioritized integration backlog (refactor / finish / new)

1. **[refactor][done] Unify auth/session strategy on `__session` and role redirects** (unblocks `02`, `03`, `14`).
   - Completed in code: admin auth now syncs via `/api/auth/session`; middleware now redirects unauthenticated `/admin/*` to `/admin/login`.
2. **[refactor][done] Define canonical route strategy for org scope (`/admin/*` vs `/admin/[universityId]/*`)** and document migration plan (unblocks `03`, `05`, `07`).
   - Decision record: `docs/prds/00-route-strategy-decision-admin-scope.md`.
3. **[finish][done] Wire admin organization selector to real memberships/universities** (unblocks `05`, `06`).
   - Completed in code: `/admin` now loads active ADMIN memberships, resolves linked universities, renders live cards, and includes empty/legacy membership states.
4. **[finish][done] Implement buildings and rooms CRUD using existing Firestore helpers** (unblocks `04`, `07`).
   - Completed in code: `/admin/buildings` and `/admin/rooms` now support live list/search/create/edit/delete scoped by `universityId`.
5. **[finish][done] Implement tenant and inspector lifecycle actions (invite/status/assignments)** on existing pages (unblocks `06`, `11`).
   - Completed in code: `/admin/tenants` and `/admin/inspectors` now support invite flows, status activation/deactivation, and assignment updates.
6. **[finish][done] Implement inspection scheduling write-path + status state machine** (unblocks `07`, `13`).
   - Completed in code: `/admin/inspections`, `/admin/inspections/schedule`, and `/admin/inspections/[inspectionId]` now run on Firestore with controlled status transitions.
7. **[finish][done] Persist inspector runner data to Firestore (`inspections`, `inspectionItems`)** and remove local-only completion behavior (unblocks `08`, `13`).
   - Completed in code: `/inspector` now runs on Firestore-backed assignments with persisted start/save/finish flows and `inspectionItems` upserts.
8. **[finish][done] Implement media upload persistence + metadata linkage to inspection items** (unblocks `12`, `09`).
   - Completed via inspector evidence upload flow (`Storage` + `media` records), with admin inspection detail now surfacing linked media evidence URLs.
9. **[new][done] Build tenant inspections list/detail + evidence view surfaces** (unblocks `09`, `11`).
   - Completed in code: `/tenant` now loads tenant-scoped inspections from Firestore and `/tenant/inspections/[inspectionId]` shows checklist findings and linked media evidence.
10. **[new][done] Add AI summary backend flow (generate -> review -> finalize)** with fallback/error handling (unblocks `10`, `15`).
   - Completed in code: added `/api/inspections/[inspectionId]/summary` actions (`generate`, `review`, `finalize`), admin review controls on inspection detail, and tenant visibility gated to finalized summaries.
11. **[new][done] Add audit log/event model for key lifecycle transitions** (unblocks `13`, `14`, `17`).
   - Completed in code: introduced `auditEvents` collection model and event writes across inspection status transitions, scheduling, membership invites/status updates, and summary lifecycle actions.
12. **[new][done] Add security rules, rules tests, and baseline E2E golden-path tests** before release hardening (unblocks `14`, `17`, `18`).
   - Completed in code: added baseline `firestore.rules` + `storage.rules`, Firebase emulator wiring, Firestore rules tests, and Playwright golden-path E2E scaffold/config.

## Acceptance criteria (this pass)
- Every top-level roadmap area is mapped to concrete code or marked not started. ✅
- Conflicts between master PRD routes and actual routes are documented with decisions. ✅
- One golden-path journey and current blockers are explicit. ✅
- Subsequent PRs can reference this inventory to avoid parallel incompatible implementations. ✅

## Maintenance
Re-run this alignment when major routing changes, role model updates, or Firestore schema changes land. Update date after each pass.

**Last reconciled:** 2026-03-23
