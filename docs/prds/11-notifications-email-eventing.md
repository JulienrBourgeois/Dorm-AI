# PRD-11: Notifications and Email Eventing

## Goal
Implement reliable event-driven notifications for account and inspection milestones.

## Source alignment
- Master PRD sections: 11.8, 12.1-12.6.
- Functional requirements: FR-33 through FR-35.

## Scope
- Event definitions: invite, password reset, inspection scheduled, reminder, completed, account status change.
- Email templates with role-aware copy.
- Delivery pipeline (SES or equivalent) and retry logic.
- Basic in-app inbox integration for key events.

## Reliability requirements
- Idempotent send behavior.
- Event logs and delivery status tracking.
- Manual resend controls for admins (where appropriate).

## Acceptance criteria
- Each trigger emits exactly one notification event.
- Templates render correctly with required dynamic data.
- Failure states are observable and recoverable.
- Notification content respects role and data scope.
