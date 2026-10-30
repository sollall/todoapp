# 目標ツリー

目標をサブ目標・タスクのツリーに分解し、子の達成度を集計方法（すべて=min・どれか=max・Σ 合計・Π 積・k 個以上）に従って親へ伝えるアプリです。
前提（依存関係）の設定、「次の一手」の提示、項目ごとの進捗の記録ができます。

「スケジュール」ボタンで、目標・前提のDAGから日ごとの作業予定を作れます。

- タスクごとの見積もり（時間、既定 1h）と進捗から残り時間を出し、1日の作業時間に詰めます（開始日・1日の時間・土日休みを設定可）。
- 前提（自分や祖先に付いたもの）が先に終わる順番で並べ、目標は上から順に片付けます。
- ∨ どれか・k 個以上・Σ 合計では、残り時間あたりの効きがよい子だけを選び、選ばなかった子は「今回はやらなくてよいもの」に出します。
- 目標ごとの達成見込み日を表示します。

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
