# 目標ツリー

目標をサブ目標・タスクのツリーに分解し、子の達成度を集計方法（すべて=min・どれか=max・Σ 合計・k 個以上）に従って親へ伝えるアプリです。
前提（依存関係）の設定、「次の一手」の提示、項目ごとの進捗の記録ができます。
「ガントチャート」ボタンで、タスクの所要日数と前提から自動で引いた日程表（ガントチャート）に切り替えられます。並行して進める設定では、クリティカルパス（遅れると完了日が延びるタスク）と余裕日数も表示します。
ガントチャートでは「休みの期間」（お盆・年末年始など）を登録でき、その日は所要日数に数えず飛ばして日程を引きます。「土日も休みにする」で週末も同じ扱いにできます。
ツリーの上には、いま着手できるタスクを予定の早い順に並べた「今日やること」が出ます。

アプリ本体は `my_app/index.html` 1ファイル（HTML・CSS・JavaScript）で完結しています。データはブラウザの localStorage に保存されます。

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
- `my_app/public/sw.js` … Service Worker。アプリ本体はネット優先（更新はすぐ反映）、つながらないときは保存済みのものを使う。キャッシュの中身を大きく変えたときは `VERSION` を上げる
- `my_app/public/icons/` … アイコン（`icon.svg` / `maskable.svg` が元データ）

## Microsoft Store への公開手順

1. `main` に push して GitHub Pages に公開されたことを確認する
2. https://www.pwabuilder.com に公開 URL を入れて診断し、「Package For Stores」→ Windows でパッケージを作る
3. Partner Center（https://partner.microsoft.com/dashboard）で開発者登録（個人は無料）し、アプリ名を予約する
4. 予約で表示される Package ID・Publisher などを PWABuilder に入れてパッケージを作り直し、`.msixbundle` を Partner Center にアップロードして審査に出す

ストア版の中身は公開ページそのものなので、以後は push するだけで内容が更新されます（アイコンや名前を変えたときだけパッケージを作り直す）。
