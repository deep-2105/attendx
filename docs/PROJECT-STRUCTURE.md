# AttendX Project Structure

## Application Entry

- `src/App.jsx` coordinates application state, navigation, authentication state and role-aware rendering.
- `src/main.jsx` bootstraps the React application.

## Pages

The `src/pages/` directory contains the major application screens, including public pages, authentication screens, professor views and student views.

## Components

The `src/components/` directory contains reusable UI and access-control pieces such as protected-role handling, access-denied presentation and shared interface elements.

## Services and Utilities

- `src/services/` contains backend/data service helpers.
- `src/utils/` contains utility modules including Supabase client configuration.
- `src/auth.js` contains authentication/session helpers.
- `src/storage.js` contains local persistence helpers used by the application.

## Styles

Global and portal-specific styles are separated into CSS files so public pages and authenticated dashboards can maintain their own visual systems while sharing the overall AttendX identity.

## Development Principle

When modifying AttendX, first identify whether the change belongs to presentation, application state, authentication, data access or styling. Keep unrelated layers unchanged whenever possible.
