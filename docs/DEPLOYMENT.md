# AttendX Deployment Checklist

## Before Deployment

- [ ] Confirm the correct Git branch is being deployed.
- [ ] Install dependencies with `npm install`.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint` where applicable.
- [ ] Confirm no secrets or passwords are present in source files.
- [ ] Confirm Vite environment variables are configured in the deployment environment.

## Supabase Configuration

- [ ] Verify the production Supabase project URL.
- [ ] Verify the publishable client key.
- [ ] Confirm required tables and authentication users exist.
- [ ] Confirm Row Level Security remains enabled for protected data.
- [ ] Verify role/profile resolution for both professor and student accounts.

## Vercel

- [ ] Confirm the AttendX project is linked to the intended repository.
- [ ] Confirm production environment variables are configured.
- [ ] Deploy from the intended production branch.
- [ ] Review deployment logs if the build fails.
- [ ] Open the deployed site after deployment.

## Smoke Test

- [ ] Landing page loads.
- [ ] Professor login works.
- [ ] Student login works.
- [ ] Professor dashboard loads.
- [ ] Student dashboard loads.
- [ ] Logout works.
- [ ] Protected routes remain protected.
- [ ] Attendance pages and reports load correctly.

## After Deployment

- [ ] Verify the production URL.
- [ ] Check browser console for unexpected runtime errors.
- [ ] Confirm responsive layout at desktop and mobile widths.
- [ ] Keep the deployment linked to the corresponding Git commit for traceability.
