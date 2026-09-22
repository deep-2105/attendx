# AttendX Troubleshooting Notes

## Build

Run `npm run build` and investigate the first meaningful compiler error.

## Authentication

If login fails, verify Supabase configuration, authentication users, matching profiles and role values.

## Access Denied

An authenticated session may exist before profile/role resolution completes. Verify the loading state before treating an authorization error as genuine.

## Navigation

If a control is not clickable, inspect overlays, z-index, pointer-events, disabled state, click handlers and route mappings.

## Styling

For unexpected styling, inspect earlier CSS syntax and broad selectors before rewriting individual components.

## Deployment

If local build succeeds but production fails, compare deployment environment variables with the local configuration and inspect the deployment build log.