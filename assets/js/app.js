document.addEventListener('DOMContentLoaded', async()=>{
  await Auth.ensureDefaults(); UI.init(); Emailer.loadToForm();
  E('first-run-note').innerHTML='Use your saved local admin/staff credentials. For security, credentials are not displayed in the app or source code.'; E('first-run-note').classList.remove('hidden');
  const session=Auth.loadSession(); if(session) UI.afterLogin();
  E('btn-login').addEventListener('click', async()=>{ try{ await Auth.login(E('login-name').value.trim(), E('login-pass').value); E('login-error').classList.add('hidden'); UI.afterLogin(); }catch(err){ E('login-error').textContent=err.message; E('login-error').classList.remove('hidden'); }});
  E('login-pass').addEventListener('keydown',e=>{ if(e.key==='Enter') E('btn-login').click(); });
  E('btn-logout').addEventListener('click',()=>{Auth.logout(); location.reload();});
  E('f-total').addEventListener('input',()=>Orders.calc()); E('f-paid').addEventListener('input',()=>Orders.calc());
  E('f-image').addEventListener('change',e=>Orders.preview(e.target.files[0]));
  E('btn-place').addEventListener('click',()=>Orders.create()); E('btn-clear').addEventListener('click',()=>Orders.clearForm());
  E('btn-confirm-delivery').addEventListener('click',()=>Orders.confirmDelivery());
  E('btn-save-email').addEventListener('click',()=>{Emailer.saveFromForm(); E('email-warning').classList.add('hidden');});
  E('btn-test-email').addEventListener('click',()=>Emailer.test());
  E('btn-clear-log').addEventListener('click',()=>{if(confirm('Clear activity log?')){DB.set('logs',[]);UI.renderActivity();UI.renderDashboard();}});
  E('btn-save-users').addEventListener('click', async()=>{
    try{
      await Auth.saveLocalUsers({adminName:E('u-admin-name').value, adminPass:E('u-admin-pass').value, staffName:E('u-staff-name').value, staffPass:E('u-staff-pass').value});
      E('u-admin-name').value=''; E('u-admin-pass').value=''; E('u-staff-name').value=''; E('u-staff-pass').value='';
      const st=E('user-status'); st.className='alert success'; st.textContent='✅ Local login settings saved securely as hashes.'; st.classList.remove('hidden');
      U.toast('User settings saved','success');
    }catch(err){
      const st=E('user-status'); st.className='alert error'; st.textContent='❌ '+(err.message||'Could not save user settings.'); st.classList.remove('hidden');
      U.toast(err.message||'Could not save user settings','error');
    }
  });
  setInterval(()=>{ if(Auth.current && E('new-order').classList.contains('active')) Orders.prefill(); },30000);
});
