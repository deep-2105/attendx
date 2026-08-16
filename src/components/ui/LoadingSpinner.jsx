import React from 'react';

export default function LoadingSpinner({ size=36 }){
  return (
    <div style={{width:size,height:size,display:'grid',placeItems:'center'}}>
      <svg width={size} height={size} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.12)" strokeWidth="6" fill="none" />
        <circle cx="25" cy="25" r="20" stroke="#7c6cf2" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="31.4 31.4" transform="rotate(-90 25 25)">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
