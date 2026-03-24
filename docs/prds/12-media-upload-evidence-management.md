# PRD-12: Media Upload and Evidence Management

## Goal
Support secure, scalable photo evidence handling integrated directly into inspections.

## Source alignment
- Master PRD sections: 4.1.8, 8.2, 8.3, 9.5, 11.5.

## Scope
- Upload images during inspection execution.
- Media metadata model with references to inspection and checklist item.
- Storage path strategy by university/inspection.
- Role-aware retrieval and display.

## Guardrails
- Validate file types and size limits.
- Prevent orphaned media records.
- Require authorization for upload/read/delete operations.

## Acceptance criteria
- Inspectors can upload and attach photos to inspection items.
- Admin and tenant visibility follows permission rules.
- Media loads reliably in inspection detail views.
- Storage and Firestore records remain consistent after failures.
