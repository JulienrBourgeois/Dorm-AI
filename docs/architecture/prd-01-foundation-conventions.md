# PRD-01 Foundation Conventions

This document defines the implementation pattern for new work after PRD-01.

## Layering model

- `app/*`: route handlers and page composition only.
- `components/*`: reusable presentation and interaction UI.
- `hooks/*`: UI state orchestration and subscriptions.
- `app/lib/firebase/*`: data-access primitives for Firebase (Auth/Firestore/Storage).
- `lib/auth/*`: auth and RBAC routing logic.
- `lib/core/*`: cross-cutting primitives (error model, API responses, validation).
- `app/lib/ai/*`: AI integration boundary interfaces and providers.
- `types/*`: shared domain and API contracts.

## Route handler pattern

Every API route should follow this order:

1. Parse and validate input (`lib/core/validation`).
2. Resolve auth/session guard (`lib/auth/session`).
3. Call service/integration boundary modules.
4. Return typed success/error envelopes (`lib/core/apiResponse`).

## Error and response standard

- Throw `AppError` for expected, user-facing failures with status codes.
- Use `apiOk(...)` for successful JSON responses.
- Use `apiError(...)` in catch blocks for normalized failure responses.

## API response migration note

Some clients and middleware still parse legacy shapes from early routes.
During transition, consumers may support both:

- legacy: `{ redirect }`, `{ exists }`, `{ error: "..." }`
- standardized: `{ ok: true, data: ... }` and `{ ok: false, error: { code, message } }`

New routes should only emit standardized envelopes.

## AI summary boundary

`app/lib/ai/summaryService.ts` is the stable contract for summary generation:

- current provider: `HeuristicSummaryGenerator`
- future provider: Vertex-backed generator (drop-in via `getSummaryGenerator()`)

This keeps route handlers unchanged when provider implementation changes.

## RBAC and redirect helpers

- Role-to-portal mapping comes from `lib/auth/rbac.ts`.
- Membership-level checks are centralized in helper functions before route/page decisions.
- Avoid duplicating role mapping literals in page components and route handlers.
