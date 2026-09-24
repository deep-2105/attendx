# AttendX Data Privacy Notes — September 24, 2026

AttendX handles academic attendance information and therefore should keep user access aligned with the authenticated role.

## Principles

- Students should access their own attendance information through the student portal.
- Professor functionality should remain restricted to authenticated professors.
- Database-level policies should protect records in addition to frontend route checks.
- Passwords and secret credentials should never be copied into application data or documentation.
- Development and test data should not be confused with production academic records.

The frontend should present only the information appropriate to the current user's role, while backend policies remain responsible for enforcing protected data access.
