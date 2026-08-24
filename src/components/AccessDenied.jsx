import auth from '../auth';

export default function AccessDenied({ reason }){
  const handleSignOut = async ()=>{
    try{ await auth.signOut(); window.location.reload(); }catch{ window.location.href = '/'; }
  };

  const title = reason === 'not-authenticated' ? 'Not signed in' : reason === 'no-profile' ? 'Profile missing' : 'Access denied';
  const message = reason === 'not-authenticated'
    ? 'You must sign in to access this area.'
    : reason === 'no-profile'
    ? 'Your account is authenticated, but your AttendX profile could not be found.'
    : 'You do not have permission to view this page.';

  return (
    <div style={{display:'grid',placeItems:'center',padding:60}}>
      <div style={{maxWidth:720,textAlign:'center'}}>
        <div style={{fontSize:42,fontWeight:800,marginBottom:8}}>🚫</div>
        <h2 style={{marginTop:0}}>{title}</h2>
        <p style={{color:'#666'}}>{message}</p>
        <div style={{marginTop:18,display:'flex',gap:12,justifyContent:'center'}}>
          <button className="add-button" onClick={()=>window.location.href='/'}>Go Home</button>
          <button style={{border:0,background:'transparent',color:'#d54e59'}} onClick={handleSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
