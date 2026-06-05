const Orders = {
  selectedDeliveryId:null,
  EPS:0.01,
  isMoneyBalanced(total, paid, baki){ return Math.abs((Number(paid||0)+Number(baki||0))-Number(total||0)) <= this.EPS; },
  todayISO(){ return new Date().toISOString().slice(0,10); },
  calc(){
    const total=Number(E('f-total').value||0), paid=Number(E('f-paid').value||0), baki=Math.max(0,total-paid);
    E('f-baki').value = total ? baki.toFixed(2) : '';
    const balanced=this.isMoneyBalanced(total, paid, baki);
    E('balance-check')?.classList.toggle('hidden', !total);
    if(E('balance-check')){
      E('balance-check').className = 'balance-check '+(balanced?'ok':'bad');
      E('balance-check').textContent = balanced ? '✓ Payment check: Paid + Baki = Total' : '✕ Payment check failed: Paid + Baki must equal Total';
    }
    E('bb-total').textContent = total ? U.money(total) : '৳ —';
    E('bb-paid').textContent = paid ? U.money(paid) : '৳ —';
    E('bb-baki').textContent = total ? U.money(baki) : '৳ —';
  },
  prefill(){
    if(!Auth.current) return;
    const n=U.now();
    E('f-staff').value=Auth.current.name;
    E('f-date').value=U.fmtDate(n);
    E('f-time').value=U.fmtTime(n);
    const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    if(E('f-expected-delivery')) E('f-expected-delivery').min=tomorrow.toISOString().slice(0,10);
  },
  clearForm(){ ['f-orderno','f-customer','f-total','f-paid','f-baki','f-expected-delivery'].forEach(id=>E(id).value=''); E('f-image').value=''; E('preview').src=''; E('preview').classList.add('hidden'); E('bb-total').textContent='৳ —'; E('bb-paid').textContent='৳ —'; E('bb-baki').textContent='৳ —'; if(E('balance-check')) E('balance-check').classList.add('hidden'); this.prefill(); },
  async preview(file){
    if(!file) return;
    if(!file.type.startsWith('image/')){ U.toast('Only image files allowed','error'); E('f-image').value=''; return; }
    if(file.size > OFM_CONFIG.IMAGE_MAX_MB*1024*1024){ U.toast(`Image too large. Max ${OFM_CONFIG.IMAGE_MAX_MB}MB.`,'error'); E('f-image').value=''; return; }
    E('preview').src = await U.readFileAsDataURL(file); E('preview').classList.remove('hidden');
  },
  async create(){
    const orderno=E('f-orderno').value.trim(), customer=E('f-customer').value.trim(), staff=Auth.current?.name||'';
    const total=Number(E('f-total').value||0), paid=Number(E('f-paid').value||0), expectedDeliveryDate=E('f-expected-delivery').value, file=E('f-image').files[0];
    if(!orderno) return U.toast('Order number is required','error');
    if(!customer) return U.toast('Customer name is required','error');
    if(total<=0) return U.toast('Enter a valid total order price','error');
    if(paid<=0) return U.toast('Payment must be greater than ৳0 to place order','error');
    if(paid>total) return U.toast('Paid amount cannot exceed total price','error');
    if(!expectedDeliveryDate) return U.toast('Expected delivery date is required','error');
    const orderDay=new Date(); orderDay.setHours(0,0,0,0);
    const expected=new Date(expectedDeliveryDate+'T00:00:00');
    if(expected <= orderDay) return U.toast('Expected delivery date must be after the order date','error');
    const baki=Math.max(0,total-paid);
    if(!this.isMoneyBalanced(total, paid, baki)) return U.toast('Payment mismatch. Paid amount + Balance Due must equal Total Order Price.','error');
    if(!file) return U.toast('Order slip image is required','error');
    const orders=DB.orders();
    if(orders.some(o=>o.orderno.toLowerCase()===orderno.toLowerCase())) return U.toast('Order number already exists','error');
    const image=await U.readFileAsDataURL(file), date=U.now();
    const order={id:U.id(), orderno, customer, staff, orderDate:date, expectedDeliveryDate, image, totalPrice:total, paid, baki, status:'pending', deliveredBy:null, deliveryBakiCollected:0, deliveryDate:null, autoDeleteDate:null};
    orders.push(order); DB.saveOrders(orders);
    DB.addLog({type:'add', msg:`Order ${orderno} (${customer}) placed by ${staff} — Expected delivery: ${U.fmtDate(expectedDeliveryDate)}, Total: ${U.money(total)}, Paid: ${U.money(paid)}, Baki: ${U.money(baki)}`, user:staff});
    Emailer.send({action:'New Order Placed', staff_name:staff, order_no:orderno, customer, total_price:U.money(total), paid_amount:U.money(paid), baki_amount:U.money(baki), expected_delivery_date:U.fmtDate(expectedDeliveryDate), datetime:`${U.fmtDate(date)} ${U.fmtTime(date)}`});
    U.toast('Order placed successfully','success'); this.clearForm(); UI.refresh(); UI.showPage('pending');
  },
  openDelivery(id){
    const o=DB.orders().find(x=>x.id===id); if(!o) return;
    this.selectedDeliveryId=id; const n=U.now();
    E('d-order').value=o.orderno; E('d-staff').value=Auth.current.name; E('d-collected').value=o.baki ? o.baki.toFixed(2) : '0.00'; E('d-date').value=U.fmtDate(n); E('d-time').value=U.fmtTime(n);
    E('d-rule').textContent = `Delivery allowed only when Amount Paid Now + Collected at Delivery = Total Price. Required collection: ${U.money(o.baki)}.`;
    E('deliver-summary').innerHTML=`<b>${U.esc(o.orderno)} — ${U.esc(o.customer)}</b><br>Expected delivery: ${U.fmtDate(o.expectedDeliveryDate)}<br>Total: ${U.money(o.totalPrice)}<br>Already paid: ${U.money(o.paid)}<br><b class="red">Remaining baki: ${U.money(o.baki)}</b>`;
    E('deliver-modal').classList.remove('hidden');
  },
  confirmDelivery(){
    const collected=Number(E('d-collected').value||0), orders=DB.orders(), idx=orders.findIndex(o=>o.id===this.selectedDeliveryId);
    if(idx<0) return U.toast('Order not found','error');
    const o=orders[idx], required=Number(o.baki||0);
    if(Math.abs(collected-required)>this.EPS) return U.toast(`Delivery blocked. Collect exact remaining balance: ${U.money(required)}.`,'error');
    const finalPaid=Number(o.paid||0)+collected;
    const finalBaki=Math.max(0, Number(o.totalPrice||0)-finalPaid);
    if(Math.abs(finalPaid-Number(o.totalPrice||0))>this.EPS || finalBaki>this.EPS){
      return U.toast('Delivery blocked. Amount Paid Now + Collected at Delivery must equal Total Order Price.','error');
    }
    const date=U.now(), auto=new Date(); auto.setDate(auto.getDate()+OFM_CONFIG.ARCHIVE_RETENTION_DAYS);
    orders[idx]={...o, status:'delivered', deliveredBy:Auth.current.name, deliveryBakiCollected:collected, paid:finalPaid, baki:0, deliveryDate:date, autoDeleteDate:auto.toISOString()};
    DB.saveOrders(orders); DB.addLog({type:'deliver', msg:`Order ${o.orderno} (${o.customer}) delivered by ${Auth.current.name} — Collected: ${U.money(collected)}, Baki: ${U.money(0)}`, user:Auth.current.name});
    Emailer.send({action:'Delivery Confirmed', staff_name:Auth.current.name, order_no:o.orderno, customer:o.customer, total_price:U.money(o.totalPrice), paid_amount:U.money(orders[idx].paid), baki_amount:'৳0.00 — fully paid', expected_delivery_date:U.fmtDate(o.expectedDeliveryDate), datetime:`${U.fmtDate(date)} ${U.fmtTime(date)}`});
    E('deliver-modal').classList.add('hidden'); U.toast('Delivery confirmed. Order fully paid.','success'); UI.refresh(); UI.showPage('archive');
  },
  delete(id){ if(Auth.current?.role!=='admin') return; if(!confirm('Permanently delete this archive record?')) return; const o=DB.orders().find(x=>x.id===id); DB.saveOrders(DB.orders().filter(x=>x.id!==id)); DB.addLog({type:'delete', msg:`Order ${o?.orderno||id} deleted by admin ${Auth.current.name}`, user:Auth.current.name}); U.toast('Record deleted','error'); UI.refresh(); },
  cleanup(){ const now=new Date(); const before=DB.orders().length; const kept=DB.orders().filter(o=>!(o.status==='delivered'&&o.autoDeleteDate&&new Date(o.autoDeleteDate)<now)); if(kept.length<before){ DB.saveOrders(kept); U.toast('Expired archive records auto-deleted','info'); } },
  export(type){
    const source=DB.orders().filter(o=> type==='pending' ? o.status==='pending' : o.status==='delivered');
    const headers= type==='pending' ? ['Order No','Customer','Confirmed By','Order Date','Expected Delivery','Order Time','Total Price','Paid','Baki','Status'] : ['Order No','Customer','Confirmed By','Order Date','Expected Delivery','Total Price','Paid','Delivered By','Collected at Delivery','Actual Delivery Date','Days Left'];
    const rows=source.map(o=> type==='pending' ? [o.orderno,o.customer,o.staff,U.fmtDate(o.orderDate),U.fmtDate(o.expectedDeliveryDate),U.fmtTime(o.orderDate),o.totalPrice,o.paid,o.baki,'Pending'] : [o.orderno,o.customer,o.staff,U.fmtDate(o.orderDate),U.fmtDate(o.expectedDeliveryDate),o.totalPrice,o.paid,o.deliveredBy,o.deliveryBakiCollected,U.fmtDate(o.deliveryDate),U.daysLeft(o.deliveryDate)]);
    const csv=[headers,...rows].map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\n'); const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download=`orderflow_${type}_${new Date().toISOString().slice(0,10)}.csv`; a.click(); U.toast('CSV exported','success');
  }
};
