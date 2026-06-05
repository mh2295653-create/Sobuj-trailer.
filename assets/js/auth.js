const Auth = {
  current:null,

  normalizeUsers(users){
    const normalized = users && typeof users === 'object' ? JSON.parse(JSON.stringify(users)) : {};

    if(!normalized.admin){
      normalized.admin = {
        nameHash: OFM_CONFIG.DEFAULT_ADMIN.nameHash,
        passHash: OFM_CONFIG.DEFAULT_ADMIN.passHash
      };
    }

    if(Array.isArray(normalized.staffList)){
      normalized.staffList = normalized.staffList.filter(u => u && u.nameHash && u.passHash);
    } else if(normalized.staff && normalized.staff.nameHash && normalized.staff.passHash){
      normalized.staffList = [normalized.staff];
    } else {
      normalized.staffList = [];
    }

    const existing = new Set(normalized.staffList.map(u => `${u.nameHash}:${u.passHash}`));
    (OFM_CONFIG.DEFAULT_STAFF_LIST || []).forEach(u => {
      const key = `${u.nameHash}:${u.passHash}`;
      if(!existing.has(key)) normalized.staffList.push({nameHash:u.nameHash, passHash:u.passHash});
    });

    delete normalized.staff;
    return normalized;
  },

  async ensureDefaults(){
    const normalized = this.normalizeUsers(DB.users());
    DB.saveUsers(normalized);
    return normalized;
  },

  async login(name, pass){
    const users = await this.ensureDefaults();
    const nameHash = await U.sha256(name.trim());
    const passHash = await U.sha256(pass);

    if(users.admin.nameHash === nameHash && users.admin.passHash === passHash){
      return this.setCurrent({name:name.trim(), role:'admin'});
    }

    const staffMatch = (users.staffList || []).find(u => u.nameHash === nameHash && u.passHash === passHash);
    if(staffMatch){
      return this.setCurrent({name:name.trim(), role:'staff'});
    }

    throw new Error('Incorrect name or password.');
  },

  setCurrent(user){
    this.current = user;
    DB.saveSession(user);
    DB.addLog({type:'login', msg:`${user.name} logged in (${user.role})`, user:user.name});
    return user;
  },

  loadSession(){ this.current = DB.session(); return this.current; },
  logout(){ this.current = null; DB.clearSession(); },

  async saveLocalUsers({adminName, adminPass, staffName, staffPass}){
    const next = await this.ensureDefaults();

    if(adminName) next.admin.nameHash = await U.sha256(adminName.trim());
    if(adminPass) next.admin.passHash = await U.sha256(adminPass);

    if(staffName && staffPass){
      const newStaff = {
        nameHash: await U.sha256(staffName.trim()),
        passHash: await U.sha256(staffPass)
      };
      const key = `${newStaff.nameHash}:${newStaff.passHash}`;
      const exists = (next.staffList || []).some(u => `${u.nameHash}:${u.passHash}` === key);
      if(!exists) next.staffList.push(newStaff);
    } else if(staffName || staffPass){
      throw new Error('To add a staff login, enter both staff username and staff password.');
    }

    DB.saveUsers(next);
    DB.addLog({type:'login', msg:`Local login settings updated by ${this.current?.name || 'admin'}`, user:this.current?.name || 'admin'});
  }
};
