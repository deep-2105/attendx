import React from 'react';

export default function EmptyState({ title='Nothing here', subtitle='', action }){
  return (
    <div className="empty" style={{padding:40,textAlign:'center'}}>
      <div style={{fontSize:28,fontWeight:800,marginBottom:8}}>{title}</div>
      <div style={{color:'#9aa3c7'}}>{subtitle}</div>
      {action && <div style={{marginTop:12}}>{action}</div>}
    </div>
  );
}
