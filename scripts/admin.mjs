// Arbo の Firebase 管理用スクリプト。
// 認証: 環境変数 GOOGLE_APPLICATION_CREDENTIALS にサービスアカウントの JSON ファイルのパスを入れる
//（エミュレーターで試すときは FIRESTORE_EMULATOR_HOST・FIREBASE_AUTH_EMULATOR_HOST と GCLOUD_PROJECT を入れる）
//
//   node admin.mjs set-plan <メールアドレス> <日数>   … 有料版にする（今から <日数> 日後まで）。0 なら有料版をやめる
//   node admin.mjs show-plan <メールアドレス>         … 有料版の状態を表示する
//   node admin.mjs authorize-domain <ドメイン>        … Google ログインを許可するドメインに追加する（例: sollall.github.io）
import { readFileSync } from 'node:fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const [cmd, arg, arg2] = process.argv.slice(2);
const app = initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? {projectId: process.env.GCLOUD_PROJECT} : {credential: applicationDefault()});
const fail = msg => { console.error('エラー: ' + msg); process.exit(1); };

async function uidOf(email){
  if(!email || !email.includes('@')) fail('メールアドレスを指定してください');
  try{ return (await getAuth(app).getUserByEmail(email.trim().toLowerCase())).uid; }
  catch(e){
    if(e.code === 'auth/user-not-found') fail(email + ' のユーザーがいません。その人に一度アプリで Google ログインしてもらってから実行してください');
    throw e;
  }
}
const fmt = t => t.toDate().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'});

if(cmd === 'set-plan'){
  const days = Number(arg2);
  if(!Number.isFinite(days) || days < 0) fail('日数は 0 以上の数で指定してください');
  const uid = await uidOf(arg);
  const ref = getFirestore(app).doc('plans/' + uid);
  if(days === 0){
    await ref.set({until: Timestamp.fromMillis(Date.now() - 1000), email: arg.toLowerCase(), updatedAt: Timestamp.now()}, {merge: true});
    console.log(arg + '（' + uid + '）の有料版をやめました');
  } else {
    const until = Timestamp.fromMillis(Date.now() + days * 864e5);
    await ref.set({until, email: arg.toLowerCase(), updatedAt: Timestamp.now()}, {merge: true});
    console.log(arg + '（' + uid + '）を ' + fmt(until) + ' まで有料版にしました');
  }
} else if(cmd === 'show-plan'){
  const uid = await uidOf(arg);
  const s = await getFirestore(app).doc('plans/' + uid).get();
  const until = s.exists ? s.get('until') : null;
  if(!until) console.log(arg + '（' + uid + '）: 無料版');
  else console.log(arg + '（' + uid + '）: ' + (until.toMillis() > Date.now() ? '有料版（' + fmt(until) + ' まで）' : '無料版（' + fmt(until) + ' に期限切れ）'));
} else if(cmd === 'authorize-domain'){
  const domain = (arg || '').trim().toLowerCase();
  if(!/^[a-z0-9.-]+$/.test(domain)) fail('ドメインを指定してください（例: sollall.github.io）');
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = keyFile ? JSON.parse(readFileSync(keyFile, 'utf8')).project_id : process.env.GCLOUD_PROJECT;
  if(!projectId) fail('プロジェクト ID が分かりません（GOOGLE_APPLICATION_CREDENTIALS を設定してください）');
  const {access_token} = await app.options.credential.getAccessToken();
  const url = 'https://identitytoolkit.googleapis.com/admin/v2/projects/' + projectId + '/config';
  const headers = {Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json', 'X-Goog-User-Project': projectId};
  const cur = await fetch(url, {headers});
  if(!cur.ok) fail('設定を読めませんでした: ' + cur.status + ' ' + await cur.text());
  const domains = (await cur.json()).authorizedDomains || [];
  if(domains.includes(domain)){ console.log(domain + ' はすでに許可されています'); process.exit(0); }
  const res = await fetch(url + '?updateMask=authorizedDomains', {method: 'PATCH', headers, body: JSON.stringify({authorizedDomains: [...domains, domain]})});
  if(!res.ok) fail('追加できませんでした: ' + res.status + ' ' + await res.text());
  console.log(domain + ' を Google ログインの承認済みドメインに追加しました');
} else {
  fail('使い方: node admin.mjs set-plan <メール> <日数> | show-plan <メール> | authorize-domain <ドメイン>');
}
