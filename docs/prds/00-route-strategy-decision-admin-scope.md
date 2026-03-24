# Decision Record: Admin routing and organization scope

## Purpose
Resolve route drift before PRD-01 implementation work:
- current code uses both `/admin/*` and `/manager/[universityId]`;
- master PRD language leans toward university-scoped admin paths.

This decision avoids parallel implementations and defines a migration-safe path.

## Decision
Use **`/admin/*` as the canonical admin route family for MVP**, with active organization context provided by membership + selected university.

- Keep `universityId` as canonical data scope in Firestore/domain logic.
- Keep "property" as UX copy only; use "university" in technical code/docs.
- Treat `/manager/[universityId]` as **legacy transitional surface**.

## Why this decision (now)
- Existing admin layouts/pages are already concentrated in `/admin/*`.
- Migrating all routes to `/admin/[universityId]/*` immediately would delay core backlog execution.
- MVP priority is one working golden path, not route-perfect IA.

## Migration policy

### Phase A (pre-PRD-01 to PRD-08)
- Build all new admin work in `/admin/*`.
- Pass selected organization context through state/query/store as needed.
- Do not create new feature pages under `/manager/*`.

### Phase B (post core flow stabilization)
- Decide whether to:
  1) keep `/admin/*` permanently with explicit active org context, or
  2) migrate to `/admin/[universityId]/*` for URL-level scoping.
- If migrating, provide redirects and update links in one controlled sweep.

## Constraints for implementation
- Authorization must be membership/university-based regardless of route path.
- Route path alone must not grant data access.
- Middleware/API checks must remain source-of-truth for role and scope access.

## Immediate tasks
1. Remove legacy `admin-session` references and standardize on `__session`.
2. Keep `/manager/*` out of new feature work.
3. Ensure PRDs and tickets reference this decision to prevent route split.

## Status
- Decision owner: engineering
- Effective date: 2026-03-23
- Review date: after PRD-08 completion
