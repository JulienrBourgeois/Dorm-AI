# Orchestration: End-to-end delivery roadmap

## Goal
Deliver Dorm AI MVP from foundation through production launch, based on the master PRD sections 1-13.

## Phase 0: Align repo to PRDs (do not skip)
The codebase already contains substantial Next.js and Firebase work. Before Phase 1, complete **`00-alignment-repository-inventory-and-gaps.md`** so you:

- map existing routes and modules to these mini-PRDs;
- resolve naming drift (e.g. admin vs manager, university vs property);
- define the single end-to-end path you are tying together.

Without Phase 0, later PRDs risk duplicating or contradicting what is already built.

Also lock route scope decisions using **`00-route-strategy-decision-admin-scope.md`** before adding new admin surfaces.

## Delivery phases

### Phase 1: Foundation and guardrails
- `01-platform-foundation-architecture.md`
- `14-security-privacy-compliance.md`
- `15-performance-reliability-observability.md`

### Phase 2: Identity and access
- `02-authentication-account-lifecycle.md`
- `03-organization-membership-rbac.md`

### Phase 3: Core housing model and admin base
- `04-building-room-domain-model.md`
- `05-admin-dashboard-navigation.md`
- `06-admin-user-management-tenants-inspectors.md`

### Phase 4: Inspection lifecycle
- `07-inspection-scheduling-oversight.md`
- `08-inspector-workflow-execution.md`
- `12-media-upload-evidence-management.md`

### Phase 5: Tenant trust and communication
- `09-tenant-transparency-experience.md`
- `11-notifications-email-eventing.md`

### Phase 6: AI assist and platform integrity
- `10-ai-summary-generation-human-review.md`
- `13-audit-logging-data-integrity.md`

### Phase 7: Finish and launch
- `16-ui-design-system-empty-states.md`
- `17-testing-qa-release-readiness.md`
- `18-deployment-vercel-firebase-ops.md`

## Exit criteria for MVP
- Admin can model org, buildings, rooms, users, and schedule inspections.
- Inspector can execute full checklist with media and submit.
- Tenant can review completed inspection and evidence.
- AI summary is generated and reviewable before finalization.
- Notifications fire for key account and inspection events.
- Security rules block cross-university data access.
