# AttendX Supabase Operations Guide

## Purpose

AttendX uses Supabase for authentication and persistent application data. This guide records the expected boundaries between the React client and the backend.

## Client Configuration

The frontend uses Vite environment variables for the Supabase project URL and publishable client key. Secret or service-role keys must never be exposed to browser code.

## Authentication Flow

1. Supabase authenticates the user.
2. AttendX obtains the current session.
3. The corresponding profile is resolved.
4. The profile role determines the permitted portal.
5. Protected content is rendered only after role resolution.

## Data Access

Attendance, profiles and related application records should be accessed through the existing data/service layer rather than duplicating database calls across pages.

## Security Checks

When modifying Supabase access:

- Keep Row Level Security enabled for protected tables.
- Test both student and professor roles.
- Avoid using frontend visibility as the only security mechanism.
- Never place credentials or secrets in commits.
- Verify authorization after authentication changes.

## Operational Verification

After backend changes, verify authentication, profile resolution, attendance reads/writes and protected routes before merging frontend changes.
