function E(id){ return document.getElementById(id); }
const UI = {
  init(){
    document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>this.showPage(b.dataset.page)));
    E('hamburger').addEventListener('click',()=>E('sidebar').classList.toggle('open'));
    document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>E('deliver-modal').classList.add('hidden')));
    E('lightbox').addEventListener('click',()=>E('lightbox').classList.add('hidden'));
    document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',()=>Orders.export(b.dataset.export)));
    document.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>this.clearFilter(b.dataset.clear)));
    ['pending-search','pending-date'].forEach(id=>E(id).addEventListener('input',()=>this.renderPending()));
    ['archive-search','archive-date'].forEach(id=>E(id).addEventListener('input',()=>this.renderArchive()));
    ['s-order','s-name','s-odate','s-edate','s-ddate','s-status'].forEach(id=>E(id).addEventListener('input',()=>this.renderSearch()));
  },
  afterLogin(){
    E('login-screen').style.display='none'; E('user-pill').textContent=`● ${Auth.current.name} · ${Auth.current.role}`;
    document.body.classList.toggle('is-admin', Auth.current.role==='admin');
    document.body.classList.toggle('is-staff', Auth.current.role==='staff');
    Orders.prefill(); Orders.cleanup(); Emailer.loadToForm(); this.refresh(); this.showPage('dashboard');
    E('email-warning').classList.toggle('hidden', Emailer.configured() || Auth.current.role!=='admin');
    E('u-admin-name').value=''; E('u-admin-pass').value=''; E('u-staff-name').value=''; E('u-staff-pass').value='';
  },
  showPage(id){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); E(id).classList.add('active');
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active', n.dataset.page===id));
    E('page-title').textContent=({dashboard:'Dashboard','new-order':'New Order',pending:'Pending Orders',archive:'Delivered Archive',activity:'Activity Log',search:'Search & Filter',emailcfg:'Email Alerts Setup',users:'User Setup'})[id]||id;
    E('sidebar').classList.remove('open');
    if(id==='pending') this.renderPending(); if(id==='archive') this.renderArchive(); if(id==='activity') this.renderActivity(); if(id==='search') this.renderSearch(); if(id==='dashboard') this.renderDashboard(); if(id==='emailcfg') Emailer.loadToForm();
  },
  refresh(){ this.renderDashboard(); this.renderPending(); this.renderArchive(); this.renderActivity(); this.renderSearch(); },
  clearFilter(type){ if(type==='pending'){E('pending-search').value='';E('pending-date').value='';this.renderPending();} else {E('archive-search').value='';E('archive-date').value='';this.renderArchive();} },
  renderDashboard(){
    const orders=DB.orders(), pending=orders.filter(o=>o.status==='pending'), delivered=orders.filter(o=>o.status==='delivered'); const today=new Date().toISOString().slice(0,10), month=new Date().toISOString().slice(0,7); const baki=pending.reduce((s,o)=>s+Number(o.baki||0),0);
    E('d-pending').textContent=pending.length; E('d-today').textContent=delivered.filter(o=>o.deliveryDate?.slice(0,10)===today).length; E('d-month').textContent=delivered.filter(o=>o.deliveryDate?.slice(0,7)===month).length; E('d-baki').textContent=U.money(baki); E('pending-badge').textContent=pending.length; E('hero-pending').textContent=pending.length; E('hero-delivered').textContent=delivered.length; E('hero-baki').textContent='৳'+Math.round(baki).toLocaleString('en-BD');
    this.renderActivity('recent-list',10);
  },
  imageCell(o){ return o.image ? `<img class="thumb" src="${o.image}" data-lightbox="${o.id}">` : '—'; },
  renderPending(){
    const q=E('pending-search').value.toLowerCase(), d=E('pending-date').value; let rows=DB.orders().filter(o=>o.status==='pending');
    if(q) rows=rows.filter(o=>[o.orderno,o.customer,o.staff].some(v=>(v||'').toLowerCase().includes(q))); if(d) rows=rows.filter(o=>U.isoDate(o.orderDate)===d);
    const tb=E('pending-body'); if(!rows.length){tb.innerHTML='<tr><td colspan="14"><div class="empty">No pending orders</div></td></tr>';return;}
    tb.innerHTML=rows.map((o,i)=>`<tr><td>${i+1}</td><td class="mono">${U.esc(o.orderno)}</td><td>${U.esc(o.customer)}</td><td>${this.imageCell(o)}</td><td>${U.esc(o.staff)}</td><td>${U.fmtDate(o.orderDate)}</td><td>${U.fmtDate(o.expectedDeliveryDate)}</td><td>${U.fmtTime(o.orderDate)}</td><td class="money-t green">${U.money(o.totalPrice)}</td><td class="money-t green">${U.money(o.paid)}</td><td class="money-t red">${U.money(o.baki)}</td><td><span class="badge ${o.baki<=0?'pay-full':'pay-partial'}">${o.baki<=0?'Fully Paid':'Partial'}</span></td><td><span class="badge pending">Pending</span></td><td><button class="btn success small" data-deliver="${o.id}">Deliver</button></td></tr>`).join('');
    tb.querySelectorAll('[data-deliver]').forEach(b=>b.addEventListener('click',()=>Orders.openDelivery(b.dataset.deliver))); this.bindLightbox(tb);
  },
  renderArchive(){
    const q=E('archive-search').value.toLowerCase(), d=E('archive-date').value; let rows=DB.orders().filter(o=>o.status==='delivered');
    if(q) rows=rows.filter(o=>[o.orderno,o.customer,o.staff,o.deliveredBy].some(v=>(v||'').toLowerCase().includes(q))); if(d) rows=rows.filter(o=>U.isoDate(o.deliveryDate)===d);
    const tb=E('archive-body'); if(!rows.length){tb.innerHTML='<tr><td colspan="14"><div class="empty">No archived orders</div></td></tr>';return;}
    tb.innerHTML=rows.map((o,i)=>{const left=U.daysLeft(o.deliveryDate);return `<tr><td>${i+1}</td><td class="mono">${U.esc(o.orderno)}</td><td>${U.esc(o.customer)}</td><td>${this.imageCell(o)}</td><td>${U.esc(o.staff)}</td><td>${U.fmtDate(o.orderDate)}</td><td>${U.fmtDate(o.expectedDeliveryDate)}</td><td class="money-t green">${U.money(o.totalPrice)}</td><td class="money-t green">${U.money(o.paid)}</td><td>${U.esc(o.deliveredBy)}</td><td class="money-t green">${U.money(o.deliveryBakiCollected)}</td><td>${U.fmtDate(o.deliveryDate)}</td><td><span class="badge ${left>7?'done':'pending'}">${left>0?left+'d':'Expired'}</span></td><td class="admin-only" style="display:${Auth.current?.role==='admin'?'':'none'}"><button class="btn danger small" data-delete="${o.id}">Delete</button></td></tr>`}).join('');
    tb.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>Orders.delete(b.dataset.delete))); this.bindLightbox(tb);
  },
  renderSearch(){
    const qo=E('s-order').value.toLowerCase(), qn=E('s-name').value.toLowerCase(), od=E('s-odate').value, ed=E('s-edate').value, dd=E('s-ddate').value, st=E('s-status').value; let rows=DB.orders();
    if(qo) rows=rows.filter(o=>o.orderno.toLowerCase().includes(qo)); if(qn) rows=rows.filter(o=>[o.customer,o.staff,o.deliveredBy].some(v=>(v||'').toLowerCase().includes(qn))); if(od) rows=rows.filter(o=>U.isoDate(o.orderDate)===od); if(ed) rows=rows.filter(o=>U.isoDate(o.expectedDeliveryDate)===ed); if(dd) rows=rows.filter(o=>U.isoDate(o.deliveryDate)===dd); if(st) rows=rows.filter(o=>o.status===st);
    const tb=E('search-body'); if(!rows.length){tb.innerHTML='<tr><td colspan="12"><div class="empty">No results found</div></td></tr>';return;}
    tb.innerHTML=rows.map((o,i)=>`<tr><td>${i+1}</td><td class="mono">${U.esc(o.orderno)}</td><td>${U.esc(o.customer)}</td><td>${U.esc(o.staff)}</td><td>${U.fmtDate(o.orderDate)}</td><td>${U.fmtDate(o.expectedDeliveryDate)}</td><td class="money-t green">${U.money(o.totalPrice)}</td><td class="money-t green">${U.money(o.paid)}</td><td class="money-t red">${U.money(o.baki)}</td><td>${U.esc(o.deliveredBy||'—')}</td><td>${U.fmtDate(o.deliveryDate)}</td><td><span class="badge ${o.status==='pending'?'pending':'done'}">${o.status}</span></td></tr>`).join('');
  },
  renderActivity(target='activity-list',limit=999){
    const rows=DB.logs().slice(0,limit), box=E(target); if(!rows.length){box.innerHTML='<div class="empty">No activity yet</div>';return;}
    box.innerHTML=rows.map(l=>`<div class="activity"><span class="dot ${l.type}"></span><div><div>${U.esc(l.msg)}</div><small>${U.fmtDate(l.ts)} ${U.fmtTime(l.ts)}</small></div></div>`).join('');
  },
  bindLightbox(root){ root.querySelectorAll('[data-lightbox]').forEach(img=>img.addEventListener('click',()=>{E('lightbox-img').src=img.src;E('lightbox').classList.remove('hidden');})); }
};
