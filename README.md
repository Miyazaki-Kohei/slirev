# slirev - Marp Slide Review Tool

Marp デッキ HTML をスライドごとにプレビューしながらコメントを残せる Web UI ツール。

## Installation

### npx (インストール不要)

```bash
npx @miyakoh/slirev
```

### グローバルインストール

```bash
npm install -g @miyakoh/slirev
```

### Claude Code Skill

```bash
npx skills add Miyazaki-Kohei/slirev
```

### ソースから

```bash
git clone https://github.com/Miyazaki-Kohei/slirev.git
cd slirev && npm install && npm run build && npm link
```

## Setup

Playwright の Chromium が必要です（初回のみ）:

```bash
npx playwright install chromium
```

Chromium が未インストールの場合、起動時にエラーメッセージで案内されます。

## Usage

### ファイル選択モード

引数なしで起動すると、カレントディレクトリ以下の Marp デッキ HTML を一覧表示します。

```bash
npx @miyakoh/slirev
```

ブラウザが開き、ファイル一覧が表示されます。クリックするとレビュー画面が生成されます。

### 直接指定モード

特定のデッキファイルを直接指定してレビューを開始します。

```bash
npx @miyakoh/slirev output/my-deck/deck.html
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--no-browser` | ブラウザの自動起動を抑制 |

```bash
npx @miyakoh/slirev --no-browser                    # URLのみ表示
npx @miyakoh/slirev output/deck.html --no-browser   # 直接指定 + ブラウザ抑制
```

サーバーはレビュー画面の「終了」ボタン、または `Ctrl+C` で停止できます。

## Features

- **ファイル選択 UI**: CWD 以下のデッキ HTML を一覧表示、クリックでレビュー開始
- **スライドプレビュー**: Playwright でスライドを画像キャプチャし表示（標準モード・Bespoke モード両対応）
- **ファイル切り替え**: レビュー画面のヘッダーからプルダウンで他のデッキに切り替え可能
- **ナビゲーション**: `←` `→` キーまたはボタンでスライド切り替え
- **コメント機能**: スライドごとにコメントを追加・削除、localStorage に自動保存
- **クイックアクション**: スキル呼び出しテキストをワンクリックで挿入
- **レイアウト選択モーダル**: 39 種のスライドレイアウトパターンをサムネイル付きで一覧表示
- **JSON エクスポート**: 全コメントを `@相対パス` 形式のデッキパス付き JSON でクリップボードにコピー
- **サーバー終了**: ブラウザ上の「終了」ボタンからサーバーを停止可能
- **メモリ上で動作**: レビュー HTML はメモリ上で生成・配信、ファイルを一切書き出さない

## Workflow

### 基本的なレビューフロー

```bash
# 1. Marp デッキのあるディレクトリで起動
cd my-presentation
npx @miyakoh/slirev

# 2. ブラウザでファイルを選択 → レビュー画面が開く
# 3. 各スライドにコメントを記入
# 4. JSON エクスポートでコメントをコピー
# 5. 「終了」ボタンでサーバー停止
```

### 特定ファイルを直接レビュー

```bash
npx @miyakoh/slirev dist/my-presentation.html
```

### CI / リモート環境

```bash
npx @miyakoh/slirev --no-browser
# 表示された URL にブラウザでアクセス
```

## File Structure

```
slirev/
├── src/
│   └── index.ts              # CLI エントリポイント（TypeScript）
├── templates/
│   ├── picker.html           # ファイル選択 UI
│   └── review-template.html  # レビュー UI テンプレート
├── pattern-thumbnails/       # レイアウトパターンのサムネイル画像
├── skills/
│   └── slirev/SKILL.md       # Claude Code Skill 定義
├── svg/
│   └── slirev-icon.svg       # アイコン（favicon）
├── sample-html/              # テスト用サンプル
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Requirements

- Node.js >= 18
- Chromium (via Playwright)

## License

MIT
