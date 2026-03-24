# PRD-18: Deployment, Environments, and Operations

## Goal
Ship Dorm AI MVP to production with controlled environment management and operational readiness.

## Source alignment
- Master PRD sections: 8.1, 9.7, 13.1.

## Scope
- Environment separation (local, preview, production).
- Vercel deployment strategy with protected production branch.
- Firebase project config and rule deployment workflow.
- Secrets and API key rotation process.

## Operational checklist
- Build and smoke tests on preview deploys.
- Firestore/Storage rules deployment and verification.
- Email provider credentials and domain verification.
- Monitoring + alert entry points documented.

## Acceptance criteria
- Production deployment is repeatable from documented steps.
- Required secrets are present and validated at startup.
- Critical services (auth, db, storage, ai, email) pass post-deploy smoke tests.
- Team can rollback to last stable release.
