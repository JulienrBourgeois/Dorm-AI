# PRD-13: Audit Logging and Data Integrity

## Goal
Guarantee trustworthy inspection history through immutable event tracking and consistent timestamps.

## Source alignment
- Master PRD sections: 9.8, 11.9.
- Functional requirements: FR-36 through FR-38.

## Scope
- Audit trail for key events: schedule, assign, start, submit, approve summary, status changes.
- Created/updated timestamps and actor identifiers.
- Consistency checks for room/inspection/membership relations.

## Integrity strategy
- Prefer append-only audit events for sensitive transitions.
- Enforce transaction or batched-write usage where relationships must update together.
- Add repair scripts for known drift scenarios.

## Acceptance criteria
- Every critical workflow action has auditable metadata.
- Audit records are queryable by inspection and organization.
- Data integrity checks catch mismatched references early.
- No silent overwrite of critical state changes.
