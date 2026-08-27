import AccessDenied from './AccessDenied';

export const AUTH_LOADING = 'AUTH_LOADING';
export const UNAUTHENTICATED = 'UNAUTHENTICATED';
export const AUTHENTICATED_ROLE_LOADING = 'AUTHENTICATED_ROLE_LOADING';
export const AUTHENTICATED_ROLE_RESOLVED = 'AUTHENTICATED_ROLE_RESOLVED';

function AttendXLoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>AttendX</div>
        <p style={{ margin: '10px 0 0', color: '#9aa3c7' }}>Loading your workspace...</p>
      </div>
    </div>
  );
}

export default function RequireRole({
  session,
  role,
  authState,
  children,
}) {
  const resolvedState = authState ?? (
    session
      ? AUTHENTICATED_ROLE_RESOLVED
      : UNAUTHENTICATED
  );

  if (resolvedState === AUTH_LOADING || resolvedState === AUTHENTICATED_ROLE_LOADING) {
    return <AttendXLoadingScreen />;
  }

  if (resolvedState === UNAUTHENTICATED || !session) {
    return null;
  }

  if (!session.profile) {
    return <AttendXLoadingScreen />;
  }

  if (session.profile.role !== role) {
    return resolvedState === AUTHENTICATED_ROLE_RESOLVED ? <AccessDenied reason="forbidden" /> : <AttendXLoadingScreen />;
  }

  return <>{children}</>;
}
