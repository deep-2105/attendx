# AttendX Supabase Operations Notes

AttendX uses Supabase for authentication and persistent application data.

- Authentication establishes user identity and session state.
- Profile resolution determines whether the user is a professor or student.
- Protected tables should retain Row Level Security.
- Publishable client configuration may be used in browser code; secret/service-role credentials must not be committed.
- Backend authorization remains the security boundary even when frontend routes hide controls.

After database or authentication changes, verify both professor and student flows before merging.