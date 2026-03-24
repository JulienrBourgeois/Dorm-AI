# PRD-14: Security, Privacy, and Compliance Controls

## Goal
Implement mandatory controls for access, confidentiality, and safe handling of housing inspection data.

## Source alignment
- Master PRD sections: 8.2, 9.2, 9.3.

## Scope
- Authentication hardening and secure session handling.
- Role- and university-scoped authorization in UI, APIs, Firestore, and Storage.
- Sensitive data minimization and least-privilege access.
- Privacy policy and terms integration in public pages.

## Security tests
- Cross-role and cross-university access denial tests.
- Direct URL access bypass attempts.
- Storage object rule validation.

## Acceptance criteria
- Unauthorized requests are denied consistently across layers.
- Tenant data and evidence are not exposed outside authorized scope.
- Sensitive operations are protected and audited.
- Security rule regressions are prevented via automated tests.
