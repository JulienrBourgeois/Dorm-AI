# PRD-17: Testing, QA, and Release Readiness

## Goal
Define and execute the validation strategy required before MVP release.

## Scope
- Unit tests for domain and utility logic.
- Integration tests for auth, RBAC, scheduling, execution, and summary generation.
- End-to-end flows for admin, inspector, and tenant critical paths.
- Regression suite for security rules and notification triggers.

## Required test journeys
- Admin creates org structure, invites users, schedules inspection.
- Inspector completes inspection with media and submits.
- AI summary generated, reviewed, and published.
- Tenant views completed report and evidence.

## Acceptance criteria
- All critical path tests pass in CI.
- No unresolved P0 or P1 defects at release cut.
- Rollback plan exists for deployment failures.
- Release notes document known limitations and post-MVP items.
