# AttendX Architecture

## Overview

AttendX is a React/Vite web application backed by Supabase. The application is organized around two authenticated roles: professor and student.

## Main Layers

### Presentation Layer

React pages and reusable components provide the landing page, login screens, professor portal, student portal, dashboards, reports, analytics and settings.

### Application Layer

The application coordinates navigation, authentication state, role resolution, attendance calculations and UI state. Route selection is kept in the application so authenticated users are directed to the portal that matches their profile role.

### Authentication Layer

Supabase Auth provides email/password authentication and session persistence. After authentication, AttendX resolves the corresponding profile before protected role-specific screens are rendered.

### Data Layer

Supabase/PostgreSQL stores application records such as profiles, attendance data and login activity. Database-level security is used alongside frontend route protection.

## Role Boundaries

- **Professor:** management, student records, attendance operations, reports, analytics and settings.
- **Student:** personal dashboard, subjects, attendance, analytics and profile.
- A student's frontend navigation should never be treated as the security boundary; database policies remain responsible for protecting data.

## Data Flow

1. User opens AttendX.
2. The application restores any existing Supabase session.
3. If no session exists, public landing/login screens are shown.
4. If a session exists, the application resolves the user's profile and role.
5. The role determines the permitted portal routes.
6. Attendance and profile operations communicate with Supabase.
7. Reporting and analytics derive summaries from attendance records.

## Deployment

The frontend is built with Vite and can be deployed through Vercel. Client configuration is supplied through Vite environment variables. Secret/service-role credentials must not be included in browser code or committed to Git.

## Design Principle

Changes should be incremental. Existing authentication, database, attendance and navigation behavior should be preserved when making visual or structural improvements.
