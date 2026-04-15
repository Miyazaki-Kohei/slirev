---
name: slirev
description: Marp スライドのレビュー・フィードバックツール。Marp デッキ HTML をスライドごとにプレビューしながらコメントを残せる Web UI を起動する。ユーザーがスライドレビュー、プレゼン確認、Marp デッキのフィードバック、スライドへのコメント追加、プレゼンテーションのチェックについて言及した場合にこのスキルを使うこと。「スライドを確認したい」「プレゼンにコメントしたい」「デッキをレビューして」といった要望にも対応する。
---

# slirev - Marp スライドレビューツール

Marp デッキ HTML をスライドごとにプレビューしながらコメントを残せる Web UI ツール。  
グローバル未インストールの場合は `npx @miyakoh/slirev` で実行できる。

## クイックリファレンス

```bash
npx @miyakoh/slirev                              # ファイル選択モード（CWD以下のデッキを一覧表示）
npx @miyakoh/slirev <path/to/deck.html>          # 直接指定モード
npx @miyakoh/slirev --no-browser                 # ブラウザ自動起動を抑制
```

## インストール

```bash
# 初回のみ: Playwright 用の Chromium をインストール
npx playwright install chromium
```

## ファイル選択モード

引数なしで起動すると、カレントディレクトリ以下の Marp デッキ HTML を一覧表示する。

```bash
npx @miyakoh/slirev
```

- CWD から最大4階層まで `.html` ファイルを再帰検索
- `node_modules`, `.git`, `dist`, `*-review.html`, `*-nav.html` は除外
- ファイルをクリックするとレビューページを生成

## 直接指定モード

デッキファイルのパスを指定して直接レビューを開始する。

```bash
npx @miyakoh/slirev output/my-deck/deck.html
npx @miyakoh/slirev dist/presentation.html
```

## レビュー UI の機能

| 機能 | 説明 |
|------|------|
| スライドプレビュー | 各スライドのスクリーンショットを表示 |
| ナビゲーション | `←` `→` キーまたはボタンでスライド切替 |
| コメント | スライドごとにコメントを追加・削除、localStorage に自動保存 |
| クイックアクション | スキル呼び出しテキストをワンクリックで挿入 |
| レイアウト選択 | 39種のスライドレイアウトパターンをサムネイル付きで表示 |
| JSON エクスポート | 全コメントを JSON 形式でクリップボードにコピー |

## よくあるワークフロー

### プレゼンテーションをレビューする

```bash
cd my-presentation-project
npx @miyakoh/slirev
# ブラウザでファイルを選択 → スライドをレビュー → コメントを JSON エクスポート
```

### 特定のファイルをブラウザなしでレビューする

```bash
npx @miyakoh/slirev dist/deck.html --no-browser
# 表示された URL に手動でアクセス
```

## 対応フォーマット

- 標準 Marp HTML（`svg[data-marpit-svg]` ベース）
- Bespoke モード Marp HTML（キーボードナビゲーションベース）

## 動作要件

- Node.js >= 18
- Chromium（`npx playwright install chromium` でインストール）
