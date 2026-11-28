# Arbo

目標をサブ目標・タスクのツリーに分解し、子の達成度を集計方法（すべて=min・どれか=max・Σ 合計・k 個以上）に従って親へ伝えるアプリです。
前提（依存関係）の設定、「次の一手」の提示、項目ごとの進捗の記録ができます。
「ガントチャート」ボタンで、タスクの所要日数・前提・担当者から自動で引いた日程表（ガントチャート）に切り替えられます。
ガントチャートでメンバーを登録し、タスクごとに担当者を選べます（ツリーの各タスクや進捗の記録パネルの「担当」からも選べ、どこで変えても連動します）。同じ人のタスクは1つずつ順番に、別の人どうしは並行に進む日程になります。担当が「自動」のタスクは、いちばん早く手が空く人に割り当てます。メンバーが1人（またはいない）ときは、すべて1つずつ順番に進める日程です。
ガントチャートでは「休みの期間」（お盆・年末年始など）を登録でき、その日は所要日数に数えず飛ばして日程を引きます。「土日も休みにする」で週末も同じ扱いにできます。
ツリーの上には、いま着手できるタスクを予定の早い順に並べた「今日やること」が出ます（「表示」で自分の担当だけに絞れます）。

アプリ本体は `my_app/index.html` 1ファイル（HTML・CSS・JavaScript）で完結しています。データはブラウザの localStorage に保存され、Firebase を設定してログインすると Firestore にも保存されます（下記）。
Claude の Artifact として公開した場合は、共有された全員が同じツリーを見て編集でき、ほかの人の変更も自動で反映されます（同時に編集したときは後から保存した内容が残ります）。

## Firebase でデータを管理する・チームで共有する

`my_app/public/firebase-config.js` に Firebase の設定を書くと、画面右上に「ログイン」ボタンが出ます。Google でログインすると、ツリー・メンバー・進捗の記録などすべてのデータが Firestore に保存され、ほかの端末で同じアカウントでログインすれば同じデータを使えます。
設定が空のとき・ログインしていないとき・ファイルを直接開いたときは、これまで通りこの端末（localStorage）にだけ保存します。オフラインでもこの端末には保存され、つながったときにクラウドへ送られます。

### チームで共有する

ログインすると「共有」ボタンが出ます。

- **新しいツリーを作る** … チーム用のツリーを作ります（最初のログインで自分用の「マイツリー」が自動で作られます。これも共有できます）
- **招待** … メンバーのメールアドレス（Google アカウント）を追加します。招待された人はそのアカウントでログインすると「開くツリー」から選べます。「共有リンクをコピー」で送ったリンクからも開けます
- メンバー全員が同じツリーを編集でき、ほかの人の変更はすぐに反映されます（同時に編集したときは後から保存した内容が残ります）
- メンバーの追加・解除とツリーの削除はオーナー（作った人）だけができます。オーナー以外は「このツリーから抜ける」ことができます
- ガントチャートの「メンバー」（担当者の名前）は共有メンバーとは別に、ツリーの中で登録します

データは `trees/{ツリーID}` に1ツリー1ドキュメント（`name`・`owner`・`ownerEmail`・`members`・`json`）で保存され、`members` に入っているメールアドレスの人だけが読み書きできます（`firestore.rules`）。`users/{uid}` には自分用ツリーの ID と最後に開いたツリーを覚えています。

初回の設定手順:

1. https://console.firebase.google.com でプロジェクトを作る
2. 「Authentication」→「Sign-in method」で **Google** を有効にする。「設定」→「承認済みドメイン」に公開先（例: `sollall.github.io`）を追加する（`localhost` は最初から入っています）
3. 「Firestore Database」を作成する（本番モードで可）
4. 「プロジェクトの設定」→「マイアプリ」でウェブアプリを追加し、表示された `firebaseConfig` の値を `my_app/public/firebase-config.js` に貼り付ける（この値は公開しても問題ありません）
5. セキュリティルール（メンバーだけが読み書きできる）を反映する。コンソールの Firestore →「ルール」に `firestore.rules` の中身を貼るか、Firebase CLI で次を実行する

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

### 手元で試す（エミュレーター）

本物の Firebase プロジェクトを使わずに試すときは、Java を入れたうえで次を実行し、`firebase-config.js` を `projectId: 'demo-arbo'` と `emulator: {auth: '127.0.0.1:9099', firestore: '127.0.0.1:8080'}` を含む設定にします（ログインはエミュレーターの画面で好きなメールアドレスを入れて行えます）。

```bash
firebase emulators:start --only auth,firestore --project demo-arbo
```

### Firebase Hosting で公開する（任意）

GitHub Pages の代わりに Firebase Hosting でも公開できます（`firebase.json` にビルドと公開先を設定済み）。この場合、承認済みドメインの追加は不要です。

```bash
firebase deploy --only hosting
```

## 起動方法

`my_app/index.html` をブラウザで直接開くだけでも動きます。開発サーバーを使う場合は次の通りです。

```bash
cd my_app
npm install
npm run dev
```

## その他のコマンド

- `npm run build` - プロダクションビルド（`dist/` に出力）
- `npm run preview` - ビルド後のプレビュー

## 公開（GitHub Pages）

`main` に push すると `.github/workflows/deploy.yml` がビルドして GitHub Pages に公開します（Actions タブから手動実行も可）。
初回のみ、リポジトリの Settings → Pages → Build and deployment の Source を「GitHub Actions」にしてください。

## アプリとしてインストール（PWA）

公開ページはインストールできる Web アプリ（PWA）になっています。Chrome / Edge のアドレスバーのインストールボタン、スマホでは「ホーム画面に追加」から入れられ、一度開けばオフラインでも起動します。

- `my_app/public/manifest.webmanifest` … アプリ名・アイコン・色
- `my_app/public/sw.js` … Service Worker（Firebase SDK もキャッシュしてオフライン起動に対応）。アプリ本体はネット優先（更新はすぐ反映）、つながらないときは保存済みのものを使う。キャッシュの中身を大きく変えたときは `VERSION` を上げる
- `my_app/public/icons/` … アイコン（`icon.svg` / `maskable.svg` が元データ）

## Microsoft Store への公開手順

1. `main` に push して GitHub Pages に公開されたことを確認する
2. https://www.pwabuilder.com に公開 URL を入れて診断し、「Package For Stores」→ Windows でパッケージを作る
3. Partner Center（https://partner.microsoft.com/dashboard）で開発者登録（個人は無料）し、アプリ名を予約する
4. 予約で表示される Package ID・Publisher などを PWABuilder に入れてパッケージを作り直し、`.msixbundle` を Partner Center にアップロードして審査に出す

ストア版の中身は公開ページそのものなので、以後は push するだけで内容が更新されます（アイコンや名前を変えたときだけパッケージを作り直す）。
