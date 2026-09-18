# AttendX Security Notes

## Authentication

AttendX uses Supabase Authentication for user sessions. Authentication establishes identity; application authorization determines which role-specific features the user may access.

## Role-Based Access

Each authenticated user has a profile role. The frontend uses that role to select the appropriate navigation and protected routes.

Frontend route protection improves user experience, but it is not sufficient as the only security layer.

## Row Level Security

Supabase Row Level Security should remain enabled for protected application tables. Policies should be based on the authenticated user's identity and appropriate role checks.

A UI element being hidden does not protect the underlying database record.

## Client Keys

The browser may contain the Supabase project URL and publishable client key. These values are intended for client applications.

Secret/service-role keys must never be placed in Vite client environment variables, source files, committed configuration or browser-accessible code.

## Credentials

Test credentials should be entered only when needed for local or browser testing. Passwords must not be hardcoded into components, README files, documentation or Git commits.

## Login Logging

Login activity can be recorded for auditing purposes, but authentication passwords must never be copied into application tables.

## Safe Change Practices

When changing authentication or database access:

1. Inspect the existing auth flow.
2. Preserve the session-loading states.
3. Verify the profile/role lookup.
4. Check the relevant RLS policies.
5. Test both professor and student accounts.
6. Run the production build before merging.

## Incident Principle

If a security change is uncertain, prefer the database-level restriction and fail-closed behavior rather than relying on client-side visibility.
