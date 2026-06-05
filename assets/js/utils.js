const U = {
  now(){ return new Date().toISOString(); },
  fmtDate(iso){ if(!iso) return '—'; return new Date(iso).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); },
  fmtTime(iso){ if(!iso) return '—'; return new Date(iso).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); },
  isoDate(iso){ if(!iso) return ''; return new Date(iso).toISOString().slice(0,10); },
  money(v){ return '৳' + Number(v||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2}); },
  id(){ return 'ofm_' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36) + Date.now().toString(36); },
  esc(s){ const d=document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; },
  toast(msg,type='info'){
    const box=document.getElementById('toast'); const t=document.createElement('div');
    t.className='toast '+type; t.textContent=msg; box.appendChild(t); setTimeout(()=>t.remove(),3800);
  },
  daysLeft(deliveryIso){ const d=new Date(deliveryIso); d.setDate(d.getDate()+OFM_CONFIG.ARCHIVE_RETENTION_DAYS); return Math.ceil((d-new Date())/86400000); },
  async sha256(text){ const enc=new TextEncoder().encode(text); const hash=await crypto.subtle.digest('SHA-256',enc); return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join(''); },
  readFileAsDataURL(file){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }
};
