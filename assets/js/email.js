const Emailer = {
  loadToForm(){ const c=DB.email(); E('e-service').value=c.service||''; E('e-template').value=c.template||''; E('e-key').value=c.key||''; E('e-admin').value=c.admin||''; },
  saveFromForm(){
    const cfg={service:E('e-service').value.trim(), template:E('e-template').value.trim(), key:E('e-key').value.trim(), admin:E('e-admin').value.trim()};
    DB.saveEmail(cfg); this.status('✅ Email configuration saved.', 'success'); U.toast('Email configuration saved','success');
    return cfg;
  },
  configured(){ const c=DB.email(); return !!(c.service && c.template && c.key && c.admin); },
  status(msg,type){ const s=E('email-status'); s.className='alert '+type; s.textContent=msg; s.classList.remove('hidden'); },
  async send(params={}, isTest=false){
    const cfg=DB.email();
    if(!cfg.service || !cfg.template || !cfg.key || !cfg.admin){ if(isTest) this.status('❌ Missing EmailJS configuration.', 'error'); return false; }
    try{
      emailjs.init({ publicKey: cfg.key, blockHeadless:false, limitRate:{id:'orderflow_email', throttle:1000} });
      const payload={
        to_email:cfg.admin,
        from_name:params.staff_name || Auth.current?.name || 'OrderFlow Manager',
        reply_to:cfg.admin,
        staff_name:params.staff_name || '',
        action:params.action || '',
        order_no:params.order_no || '',
        customer:params.customer || '',
        total_price:params.total_price || '',
        paid_amount:params.paid_amount || '',
        baki_amount:params.baki_amount || '',
        expected_delivery_date:params.expected_delivery_date || '',
        datetime:params.datetime || `${U.fmtDate(U.now())} ${U.fmtTime(U.now())}`
      };
      const res=await emailjs.send(cfg.service, cfg.template, payload);
      console.log('EmailJS success:', res);
      if(isTest){ this.status('✅ Test email sent successfully. Check inbox/spam.', 'success'); U.toast('Test email sent successfully','success'); }
      return true;
    }catch(err){
      console.error('EmailJS full error:', err);
      const msg=err?.text || err?.message || err?.status || JSON.stringify(err);
      if(isTest){ this.status('❌ Email send failed: '+msg, 'error'); U.toast('Email send failed: '+msg,'error'); }
      return false;
    }
  },
  test(){ return this.send({action:'Test Email', staff_name:Auth.current?.name||'Admin', order_no:'TEST-001', customer:'Test Customer', total_price:U.money(5000), paid_amount:U.money(2000), baki_amount:U.money(3000), expected_delivery_date:U.fmtDate(U.now()), datetime:`${U.fmtDate(U.now())} ${U.fmtTime(U.now())}`}, true); }
};
