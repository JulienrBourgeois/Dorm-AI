# PRD-03: Organization Membership and RBAC

## Goal
Enforce university-scoped, role-driven access control using memberships as the source of authorization.

## Source alignment
- Master PRD sections: 4.1.1-4.1.3, 8.2, 9.3, 11.2.
- Personas and user stories for all roles.

## Scope
- Membership model for user-to-university role assignment.
- Admin role governance for tenant/inspector/admin users.
- Role guards in frontend and backend paths.
- Firestore and Storage rules enforcing university boundaries.

## Rules
- A user may have memberships in multiple universities.
- Effective permissions come from active membership and role.
- Cross-university read/write is denied by default.

## Acceptance criteria
- Admins can create, edit, deactivate memberships.
- Tenants and inspectors only access records in their university scope.
- Permission checks are centralized and reused.
- Security rules tests confirm denied access across org boundaries.
