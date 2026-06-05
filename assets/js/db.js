const DB = {
  key(k){ return OFM_CONFIG.STORAGE_PREFIX + k; },
  get(k, fallback=null){ try{ const v=localStorage.getItem(this.key(k)); return v ? JSON.parse(v) : fallback; }catch{ return fallback; } },
  set(k,v){ localStorage.setItem(this.key(k), JSON.stringify(v)); },
  orders(){ return this.get('orders', []); },
  saveOrders(v){ this.set('orders', v); },
  logs(){ return this.get('logs', []); },
  addLog(entry){ const l=this.logs(); l.unshift({...entry, ts:U.now()}); if(l.length>500) l.length=500; this.set('logs',l); },
  email(){ return this.get('email', {service:'', template:'', key:'', admin:''}); },
  saveEmail(v){ this.set('email', v); },
  users(){ return this.get('users', null); },
  saveUsers(v){ this.set('users', v); },
  session(){ return this.get('session', null); },
  saveSession(v){ this.set('session', v); },
  clearSession(){ localStorage.removeItem(this.key('session')); }
};
