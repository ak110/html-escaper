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

### npmを使用する場合

```bash
pnpm install
```

### ブラウザで直接利用する場合

```html
<script src="path/to/dist/html-escaper.min.js"></script>

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
