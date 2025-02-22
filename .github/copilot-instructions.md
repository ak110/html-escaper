# HTML Escaper - Copilot Instructions

このライブラリは、XSS攻撃を防ぐためのHTMLエスケープライブラリです。

## プロジェクト概要

- **目的**: 安全なHTMLコンテンツの生成
- **主な機能**: HTMLタグのエスケープ、属性のサニタイズ、CSSスタイルの検証
- **言語**: TypeScript
- **ビルドツール**: Vite
- **テストフレームワーク**: Jest

## コードの重要なポイント

### 1. HtmlEscaperクラス

メインクラスは`lib/main.ts`に実装されており、以下の主要なメソッドを提供します：

- `escapeHtml(input: string, extraSelector?: string): string`
  - HTML文字列のエスケープを行う主要メソッド
  - 任意のセレクタを追加で許可可能

### 2. セキュリティルール

以下の要素について、ホワイトリスト方式で制御しています：

- **許可タグ**: div, p, span など基本的なHTML要素
- **許可属性**:
  - グローバル: id, title, class, style
  - 要素固有: href, src, alt など
- **許可CSSプロパティ**:
  - background-color
  - color
  - font-size
  - font-weight
  - text-align
  - text-decoration
  - width
- **許可URLスキーム**:
  - http:, https:, data:, m-files:, file:, ftp:, mailto:, pw:

### 3. 実装ポイント

新機能を追加する際は、以下の点に注意が必要です：

1. 新しいタグやプロパティは、セキュリティリスクを評価した上で許可リストに追加
2. DOMParserを使用したHTML解析とサニタイズ
3. 再帰的な要素の処理による深いネストへの対応
4. 空要素（span, b, i, u）の適切な処理

### 4. テスト

- `lib/main.test.ts`にテストケースを追加
- 以下のケースのテストが重要：
  - 悪意のあるスクリプトの無効化
  - 許可された要素と属性の保持
  - 不正なURLスキームのブロック
  - CSSプロパティのサニタイズ
