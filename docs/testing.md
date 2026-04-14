# Testing

This repo uses three kinds of automated checks:

| Command | What it runs |
|---------|----------------|
| `npm run test:unit` | [Vitest](https://vitest.dev/) — fast unit tests for pure logic under `lib/` (`tests/unit/**/*.test.ts`). |
| `npm run test:e2e` | [Playwright](https://playwright.dev/) — browser tests in `tests/e2e/` against the dev server (see `playwright.config.ts`). |
| `npm run test:rules` | Firestore security rules via the Firebase emulator (`tests/rules/firestore.rules.test.mjs`). |

`npm test` runs **unit tests then E2E** (`test:unit` + `test:e2e`).

## First-time Playwright setup

Install browser binaries once (required for `test:e2e`):

```bash
npx playwright install
```

## E2E scope and Firebase

Smoke tests (landing, public pages, unauthenticated redirects) **do not** require Firebase credentials. Flows that sign in, create organizations, or exercise **admin CRUD** need either:

- **Test accounts and org IDs** in a dedicated Firebase project with env vars configured locally, or  
- **Firebase Emulator** with seeded data and the app pointed at the emulator.

Document any team-specific test users or emulator setup in your internal runbook; keep secrets out of the repo.

## Watch mode (unit)

```bash
npm run test:unit:watch
```
