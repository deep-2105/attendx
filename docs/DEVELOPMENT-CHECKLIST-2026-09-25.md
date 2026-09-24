# AttendX Development Checklist — September 25, 2026

Before merging implementation changes:

- Review the changed files and remove unrelated edits.
- Confirm authentication behavior remains intact.
- Confirm professor and student role boundaries remain intact.
- Check attendance, reports and analytics for regressions.
- Check responsive navigation and dashboard layouts.
- Run `npm run build`.
- Run `npm run lint` when applicable.
- Confirm no passwords, tokens or secret keys are present in the change.

The goal is to keep AttendX improvements incremental, reviewable and safe.