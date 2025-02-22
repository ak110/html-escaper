# HTML Escaper

安全なHTMLコンテンツを生成するためのTypeScriptライブラリです。XSS（クロスサイトスクリプティング）攻撃を防ぐため、
HTMLコンテンツを適切にエスケープし、許可された要素と属性のみを保持します。

## 主な機能

- 危険なHTMLタグとスクリプトのエスケープ
- 許可されたHTMLタグと属性の保持
- CSSスタイルのサニタイズ
- URLスキームの検証
- テキストコンテンツの適切なエスケープ

## インストール

```bash
pnpm install
```

## 使用方法

```typescript
import { HtmlEscaper } from 'html-escaper';

const escaper = new HtmlEscaper();

// 安全でない可能性のあるHTMLをエスケープ
const dirtyHtml = `
  <div onclick="alert('XSS')">
    <script>malicious code</script>
    <p style="color: red;">Hello <b>World</b></p>
  </div>
`;

const cleanHtml = escaper.escapeHtml(dirtyHtml);
// 結果: 安全なHTMLが生成されます
// - スクリプトタグはエスケープされます
// - イベントハンドラは削除されます
// - 許可された属性とスタイルは保持されます
```

## 設定可能な要素

### 許可されたタグ

基本的なHTML要素（div, p, span, a など）が許可されています。完全なリストは `getAllowedTags()` で確認できます。

### 許可された属性

- グローバル属性: id, title, class, style
- 特定の要素の属性:
  - a: href, alt, title, target, rel
  - img: src, alt, title, width, height
  - など

### 許可されたCSSプロパティ

- background-color
- color
- font-size
- font-weight
- text-align
- text-decoration
- width

### 許可されたURLスキーム

- http:
- https:
- data:
- m-files:
- file:
- ftp:
- mailto:
- pw:

## テスト

テストを実行するには：

```bash
pnpm test
```

テストケースは以下の項目をカバーしています：

- 基本的なHTMLエスケープ
- 許可されたタグと属性の処理
- スタイル属性の処理
- URLスキームの検証
- エッジケース

## セキュリティ上の考慮事項

このライブラリは以下の対策を実装しています：

1. 危険なタグのエスケープ（script, iframe など）
2. イベントハンドラの除去（onclick, onerror など）
3. スタイル属性のサニタイズ（expression() などの危険なプロパティを除去）
4. URLスキームの検証（javascript: などの危険なスキームを除去）

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
