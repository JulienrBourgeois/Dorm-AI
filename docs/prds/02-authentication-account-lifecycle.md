# PRD-02: Authentication and Account Lifecycle

## Goal
Implement secure account creation, login, password reset, and account setup funnels for all roles.

## Source alignment
- Master PRD sections: 6.1, 6.2, 11.1, 12.2.
- Functional requirements: FR-1 through FR-6.

## Scope
- Public auth pages: landing, login, forgot password.
- Account setup flow after first login.
- Join flow via invite code/link.
- Session management and protected routes.

## Core flows
- New user sign-up -> verify identity -> setup profile -> route by membership role.
- Existing user login -> role-aware dashboard redirect.
- Forgot password -> reset email -> successful re-authentication.

## Edge cases
- Expired invite links.
- Duplicate account emails.
- Login to deactivated membership.

## Acceptance criteria
- Users can create and access accounts with email/password.
- Password reset email can be requested and completed.
- Unauthorized users cannot access role-protected routes.
- First-time users are forced through setup before app usage.

## Implementation notes (current repo)
- Added explicit public auth entry routes: `/login` and `/forgot-password` (both map to signup funnel steps).
- Added invite-link join flow: `/join?code=...` plus `/api/auth/join-invite` with expiry handling and audit event logging.
- Strengthened role-protected routing in `middleware.ts` for `/tenant/*` and `/inspector/*`.
- Redirect logic now handles deactivated role memberships by routing users to `/home/dashboard` instead of role portal access.
- First-time setup enforcement remains date-of-birth/profile gated via redirect path helpers and setup funnel checks.
