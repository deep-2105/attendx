import AccessDenied from './AccessDenied';

export default function RequireRole({ session, role, children }){
  if(!session) return <AccessDenied reason="not-authenticated" />;
  if(!session.profile) return <AccessDenied reason="no-profile" />;
  if(session.profile.role !== role) return <AccessDenied reason="forbidden" />;
  return <>{children}</>;
}
