# AttendX Development Workflow

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Making a Change

Keep changes focused. A UI polish task should not unexpectedly rewrite authentication or database logic.

Recommended sequence:

1. Pull the latest `main`.
2. Create a descriptive feature branch.
3. Make one coherent change.
4. Review the diff.
5. Run build/lint checks.
6. Commit with a clear message.
7. Push the branch.
8. Open a pull request.
9. Review the PR diff.
10. Merge after verification.

## Branch Naming

Examples:

- `feature/attendance-filter`
- `fix/student-navigation`
- `docs/security-notes`
- `refactor/auth-session`

## Commit Messages

Prefer short messages that explain the change:

- `fix: prevent duplicate attendance records`
- `feat: add attendance summary filter`
- `docs: update deployment notes`
- `refactor: simplify session resolution`

## Frontend Principles

- Preserve existing working functionality.
- Prefer reusable components over duplicated markup.
- Keep loading, empty and error states explicit.
- Maintain readable contrast and keyboard focus states.
- Avoid excessive visual effects that reduce usability.
- Keep student and professor responsibilities clearly separated.

## Before Merge

Confirm:

- Authentication still works.
- Role routing still works.
- Attendance calculations are unchanged unless intentionally modified.
- Supabase operations still handle errors.
- No secrets were added.
- Responsive layouts remain usable.
- `npm run build` passes.
