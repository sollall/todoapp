// Firebase の設定。Firebase コンソール →「プロジェクトの設定」→「マイアプリ」（ウェブアプリ）の
// firebaseConfig をそのまま貼り付けてください。この値は公開しても問題ありません（アクセス制御は firestore.rules で行います）。
// 空のままなら Firebase は使わず、これまで通りこの端末（localStorage）にだけ保存します。
window.FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  // 有料版の購入ページの URL（あれば共有画面に「有料版について」ボタンを出す）
  upgradeUrl: '',
};
