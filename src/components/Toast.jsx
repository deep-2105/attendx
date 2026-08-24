import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, opts={type:'info', ttl:3000})=>{
    const id = Date.now() + Math.random();
    setToasts(t=>[...t, { id, msg, type: opts.type }]);
    setTimeout(()=> setToasts(t=> t.filter(x=>x.id!==id)), opts.ttl || 3000);
  }, []);
  const value = { show };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{position:'fixed', right:18, bottom:18, zIndex:9999}}>
        {toasts.map(t=> (
          <div key={t.id} style={{marginTop:8, background:'#111426', color:'white', padding:'10px 14px', borderRadius:10, boxShadow:'0 8px 20px rgba(0,0,0,0.12)', minWidth:200}}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(){
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
