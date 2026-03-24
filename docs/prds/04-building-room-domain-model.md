# PRD-04: Building and Room Domain Model

## Goal
Deliver normalized building and room management as the inspectable inventory backbone.

## Source alignment
- Master PRD sections: 4.1.4-4.1.5, 11.3.
- Admin pages: 6.3.10 and 6.3.11.

## Scope
- CRUD for buildings and rooms per university.
- Room-to-building hierarchy and references.
- Occupancy or tenant assignment links (where applicable).
- Search/filter/sort on admin lists.

## Data rules
- Buildings are university-scoped.
- Rooms always belong to one building.
- Deletion behavior must be explicit (soft delete preferred if inspections exist).

## Acceptance criteria
- Admin can create/edit/delete buildings.
- Admin can create/edit/delete rooms.
- Room lists can be filtered by building and status.
- Existing inspection records remain valid when room metadata updates.
