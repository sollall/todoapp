// Arbo テストモード（?demo）用の、Firebase の代わりになる簡易バックエンド。
// Firebase（Auth + Firestore）のうちアプリが使う機能だけを同じ形でまねし、データはこのブラウザの localStorage に置く。
//   - ログイン: 好きなメールアドレスを入れるだけ（タブごとに別のユーザーになれる）
//   - 同じブラウザの別タブどうしで、変更がすぐ伝わる
//   - 読み書きの可否は firestore.rules と同じ決まりを下の canRead / canWrite でまねしている
//     （firestore.rules を変えたら、ここも合わせて変えること）
const DB_KEY = 'arbo-demo-db', USER_KEY = 'arbo-demo-user';

const deny = () => Object.assign(new Error('Missing or insufficient permissions.'), {code: 'permission-denied'});
const loadDb = () => { try{ return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); }catch(e){ return {}; } };
const saveDb = db => { localStorage.setItem(DB_KEY, JSON.stringify(db)); setTimeout(notify, 0); };
// 保存した値を取り出すときに、日時（{__ts: ミリ秒}）を Firestore の Timestamp と同じ形に戻す
const revive = v => {
  if(Array.isArray(v)) return v.map(revive);
  if(v && typeof v === 'object'){
    if(typeof v.__ts === 'number'){ const t = v.__ts; return {toMillis: () => t, toDate: () => new Date(t)}; }
    const o = {}; for(const k in v) o[k] = revive(v[k]); return o;
  }
  return v;
};
const raw = v => JSON.parse(JSON.stringify(v));
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const uniq = a => [...new Set(a)];

/* ---------- Auth ---------- */
const uidOf = email => 'demo-' + email.replace(/[^a-z0-9]/g, '_');
const makeUser = email => ({uid: uidOf(email), email, displayName: email.split('@')[0], emailVerified: true});
const auth = {currentUser: null};
const authListeners = new Set();
try{ const e = sessionStorage.getItem(USER_KEY); if(e) auth.currentUser = makeUser(e); }catch(e){}
function setUser(email){
  auth.currentUser = email ? makeUser(email) : null;
  try{ if(email) sessionStorage.setItem(USER_KEY, email); else sessionStorage.removeItem(USER_KEY); }catch(e){}
  authListeners.forEach(cb => setTimeout(() => cb(auth.currentUser), 0));
  setTimeout(notify, 0);
}
export const fa = {
  getAuth: () => auth,
  GoogleAuthProvider: class {},
  onAuthStateChanged(a, cb){ authListeners.add(cb); setTimeout(() => cb(auth.currentUser), 0); return () => authListeners.delete(cb); },
  async signInWithPopup(){
    const v = (prompt('テストモード: ログインするメールアドレスを入れてください（好きなもので構いません）', 'alice@example.com') || '').trim().toLowerCase();
    if(!v) throw Object.assign(new Error('cancelled'), {code: 'auth/popup-closed-by-user'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw Object.assign(new Error('メールアドレスの形ではありません'), {code: 'メールアドレスの形ではありません'});
    setUser(v);
    return {user: auth.currentUser};
  },
  async signInWithRedirect(){ return fa.signInWithPopup(); },
  async signOut(){ setUser(null); },
};
export const fapp = {initializeApp: () => ({})};

/* ---------- ルール（firestore.rules と同じ決まり） ---------- */
const me = () => auth.currentUser;
function isPro(db, uid){
  const p = db['plans/' + uid];
  return !!(p && p.until && typeof p.until.__ts === 'number' && p.until.__ts > Date.now());
}
function canRead(db, path){
  const u = me(); if(!u) return false;
  const seg = path.split('/');
  if(seg[0] === 'trees'){ const d = db[path]; return !d || (d.members || []).includes(u.email); }
  if(seg[0] === 'plans') return true;
  if(seg[0] === 'users') return seg[1] === u.uid;
  return false;
}
function canWrite(db, path, before, after){
  const u = me(); if(!u) return false;
  const seg = path.split('/');
  if(seg[0] === 'users') return seg[1] === u.uid;
  if(seg[0] !== 'trees') return false;                       // plans はサーバーだけ
  if(!before){                                               // create
    return !!after && after.owner === u.uid && after.ownerEmail === u.email
      && Array.isArray(after.members) && after.members.length === 1 && after.members[0] === u.email;
  }
  const owner = before.owner === u.uid;
  if(!after) return owner;                                   // delete
  if(!(before.members || []).includes(u.email)) return false;
  if(after.owner !== before.owner || after.ownerEmail !== before.ownerEmail) return false;
  if(!Array.isArray(after.members) || after.members.length > 100) return false;
  const changed = k => JSON.stringify(before[k]) !== JSON.stringify(after[k]);
  const ownKeyOnly = k => {
    const a = before[k] || {}, b = after[k] || {};
    return uniq([...Object.keys(a), ...Object.keys(b)]).every(x => x === u.email || JSON.stringify(a[x]) === JSON.stringify(b[x]));
  };
  const membersOk = !changed('members')
    || (owner && after.members.includes(before.ownerEmail))
    || (!owner && sameSet(uniq(after.members), uniq(before.members).filter(x => x !== u.email)));
  const namesOk = !changed('names') || owner || ownKeyOnly('names');
  const uidsOk = !changed('uids') || (ownKeyOnly('uids') && (after.uids || {})[u.email] === u.uid);
  const contentOk = !(changed('json') || changed('updatedAt') || changed('name'))
    || before.members.length <= 1 || isPro(db, u.uid);
  return membersOk && namesOk && uidsOk && contentOk;
}

/* ---------- Firestore ---------- */
const rid = () => Array.from({length: 20}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
class FieldPath { constructor(...segs){ this.segs = segs; } }
const snapOf = (path, d) => ({id: path.split('/').pop(), exists: () => !!d, data: () => (d ? revive(d) : undefined), metadata: {hasPendingWrites: false}});
const applyValue = (cur, v) => {
  if(v && v.__op === 'union') return uniq([...(Array.isArray(cur) ? cur : []), ...v.items]);
  if(v && v.__op === 'remove') return (Array.isArray(cur) ? cur : []).filter(x => !v.items.includes(x));
  return v;
};
function write(path, make){
  const db = loadDb(), before = db[path] || null;
  const after = make(before ? raw(before) : null);
  if(!canWrite(db, path, before, after)) throw deny();
  if(after) db[path] = after; else delete db[path];
  saveDb(db);
}
const listeners = new Set();
function notify(){
  const db = loadDb();
  listeners.forEach(l => {
    if(!canRead(db, l.path)){ listeners.delete(l); if(l.err) l.err(deny()); return; }
    const cur = JSON.stringify(db[l.path] || null);
    if(cur === l.last) return;
    l.last = cur;
    l.cb(snapOf(l.path, db[l.path]));
  });
}
window.addEventListener('storage', e => { if(e.key === DB_KEY || e.key === null) notify(); });

export const ff = {
  FieldPath,
  initializeFirestore: () => ({}), getFirestore: () => ({}),
  persistentLocalCache: () => ({}), persistentMultipleTabManager: () => ({}),
  arrayUnion: (...items) => ({__op: 'union', items}),
  arrayRemove: (...items) => ({__op: 'remove', items}),
  collection: (db, name) => ({cpath: name}),
  doc: (a, ...segs) => { const path = a && a.cpath ? a.cpath + '/' + rid() : segs.join('/'); return {path, id: path.split('/').pop()}; },
  where: (field, op, value) => ({field, op, value}),
  query: (coll, w) => ({cpath: coll.cpath, w}),
  async getDoc(ref){
    const db = loadDb();
    if(!canRead(db, ref.path)) throw deny();
    return snapOf(ref.path, db[ref.path]);
  },
  async getDocs(q){
    const db = loadDb(), pre = q.cpath + '/';
    const docs = Object.keys(db)
      .filter(p => p.startsWith(pre) && !p.slice(pre.length).includes('/'))
      .filter(p => !q.w || (q.w.op === 'array-contains' && (db[p][q.w.field] || []).includes(q.w.value)))
      .filter(p => canRead(db, p))
      .map(p => snapOf(p, db[p]));
    return {docs};
  },
  async setDoc(ref, data, opt){
    write(ref.path, before => (opt && opt.merge && before ? {...before, ...raw(data)} : raw(data)));
  },
  async updateDoc(ref, a, ...rest){
    write(ref.path, before => {
      if(!before) throw Object.assign(new Error('No document to update'), {code: 'not-found'});
      const pairs = a instanceof FieldPath ? [[a, rest[0]], ...rest.slice(1).reduce((o, x, i, arr) => (i % 2 ? o : [...o, [x, arr[i + 1]]]), [])]
        : Object.keys(a).map(k => [new FieldPath(k), a[k]]);
      pairs.forEach(([fp, v]) => {
        let o = before;
        fp.segs.slice(0, -1).forEach(s => { if(!o[s] || typeof o[s] !== 'object') o[s] = {}; o = o[s]; });
        const k = fp.segs[fp.segs.length - 1];
        o[k] = applyValue(o[k], v);
      });
      return before;
    });
  },
  async deleteDoc(ref){ write(ref.path, () => null); },
  onSnapshot(ref, cb, err){
    const l = {path: ref.path, cb, err, last: undefined};
    listeners.add(l);
    setTimeout(() => { if(listeners.has(l)) notify(); }, 0);
    return () => listeners.delete(l);
  },
};

/* ---------- テスト用の操作（本物では管理者・決済の仕組みがやること） ---------- */
export const demo = {
  isPro: uid => isPro(loadDb(), uid),
  setPro(uid, on){
    const db = loadDb();
    db['plans/' + uid] = {until: {__ts: on ? Date.now() + 30 * 864e5 : Date.now() - 1000}};
    saveDb(db);
  },
  reset(){ localStorage.removeItem(DB_KEY); setUser(null); },
};
