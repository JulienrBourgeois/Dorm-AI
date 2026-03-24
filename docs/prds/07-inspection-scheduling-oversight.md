# PRD-07: Inspection Scheduling and Oversight

## Goal
Allow admins to schedule, track, and manage inspection execution states.

## Source alignment
- Master PRD sections: 6.3.7-6.3.9, 11.4.
- Functional requirements: FR-16 through FR-19.

## Scope
- Admin inspections list and detail pages.
- Schedule inspection modal/page with room, inspector, date/time, type.
- Status model: scheduled, in-progress, completed, canceled.
- Assignment and reassignment workflows.

## Data requirements
- Inspection captures roomId, universityId, inspectorId, scheduledAt, status, checklist snapshot.
- Timeline events for schedule/reassign/cancel/complete.

## Acceptance criteria
- Admin can create and edit scheduled inspections.
- Status transitions follow valid state machine.
- Oversight dashboard reflects real-time status counts.
- Scheduling actions are auditable.
