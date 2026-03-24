# PRD-01: Platform Foundation and Architecture

## Goal
Create the baseline architecture and project conventions required for all other features.

## Prerequisite
Complete **`00-alignment-repository-inventory-and-gaps.md`**. This repo already has Firebase and app structure; foundation work here should **extend and unify** those patterns rather than introduce parallel stacks.

## Scope
- Next.js App Router application structure.
- Firebase integration (Auth, Firestore, Storage, Cloud Functions).
- Vertex AI integration boundary for summaries.
- Environment variable strategy for local and deployed environments.
- Shared utility modules: auth guards, role checks, validation, error handling.

## Non-goals
- Full feature implementation.
- Post-MVP AI workflows.

## Dependencies
- None.

## Deliverables
- Feature-based folder architecture with clear separation of UI, domain, data, and services.
- Firebase client/server initialization patterns.
- Shared types for core entities: users, memberships, universities, buildings, rooms, inspections.
- Standard API/service response shape and error model.

## Acceptance criteria
- App can boot in local environment with Firebase configured.
- All core services can be initialized without circular dependencies.
- New features can follow a documented module pattern.
- Baseline linting/type checking passes in CI.

## Implementation notes (current repo)
- Module conventions are documented in `docs/architecture/prd-01-foundation-conventions.md`.
- Standard API response/error utilities: `lib/core/apiResponse.ts`, `lib/core/errors.ts`.
- Shared validation helpers: `lib/core/validation.ts`.
- Shared session/RBAC helpers: `lib/auth/session.ts`, `lib/auth/rbac.ts`.
- AI integration boundary for summaries: `app/lib/ai/summaryService.ts` (provider swap point for future Vertex integration).
