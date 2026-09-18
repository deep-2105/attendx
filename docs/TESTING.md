# AttendX Testing Checklist

Use this checklist before merging changes that affect the AttendX frontend.

## Authentication

- [ ] Landing page loads without authentication.
- [ ] Student login accepts valid student credentials.
- [ ] Professor login accepts valid professor credentials.
- [ ] Invalid credentials produce a clear error.
- [ ] Refreshing an authenticated page restores the session correctly.
- [ ] Logout clears the application session and returns to the public flow.
- [ ] No password is written to application tables or source code.

## Role Protection

- [ ] A professor can access all professor routes.
- [ ] A student can access only student routes.
- [ ] Direct navigation to an unauthorized route does not expose protected content.
- [ ] Access Denied is not shown while the session/profile is still loading.
- [ ] Changing a URL does not bypass role restrictions.

## Professor Workflow

- [ ] Dashboard KPIs render correctly.
- [ ] Students page loads student records.
- [ ] Attendance page can mark attendance.
- [ ] Bulk attendance actions behave consistently.
- [ ] Duplicate daily attendance is not created.
- [ ] Reports reflect attendance changes.
- [ ] Analytics reflect current attendance data.
- [ ] Settings page remains readable and usable.

## Student Workflow

- [ ] Student dashboard shows personal information.
- [ ] Subjects navigation works.
- [ ] Attendance history is visible.
- [ ] Attendance percentage is calculated consistently.
- [ ] Analytics are based on the student's permitted data.
- [ ] Profile information is readable.
- [ ] Professor-only controls are absent.

## UI and Responsive Checks

- [ ] Sidebar items have readable contrast.
- [ ] Active, hover and focus states are visible.
- [ ] Buttons and navigation items are clickable.
- [ ] Tables do not create unwanted horizontal overflow.
- [ ] Charts remain usable on smaller screens.
- [ ] Layout is checked at desktop, tablet and mobile widths.
- [ ] Loading and empty states are understandable.

## Build Verification

Run:

```bash
npm run build
```

For source-quality checks, also run:

```bash
npm run lint
```

Any failing check should be investigated before merging.
