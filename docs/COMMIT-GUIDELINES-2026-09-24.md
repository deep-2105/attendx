# AttendX Commit Guidelines — September 24, 2026

Keep repository history understandable by making commits focused and descriptive.

## Preferred Prefixes

- `feat:` for a new user-facing capability
- `fix:` for a defect correction
- `refactor:` for internal restructuring without intended behavior change
- `docs:` for documentation-only changes
- `chore:` for maintenance work

## Good Commit Scope

A commit should represent one coherent change. Avoid mixing unrelated UI, authentication, database and documentation work in the same commit.

## Before Commit

- Review the changed files.
- Remove accidental credentials or local artifacts.
- Run the relevant build or lint check.
- Confirm that the change does not remove existing working functionality.

Clear commit history makes later debugging, review and rollback easier.
