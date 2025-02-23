# html-escaper プロジェクト概要

このプロジェクトは、HTML文字列をエスケープするTypeScriptライブラリです。
XSS（クロスサイトスクリプティング）攻撃を防ぐため、HTMLコンテンツを適切にエスケープし、許可された要素と属性のみを保持します。

## フォルダ構成

- `.github/`: GitHub Actionsの設定ファイルなどを格納します。
- `dist/`: ビルドされたJavaScriptファイルが格納されます。
- `types/`: TypeScriptの型定義ファイルが格納されます。
- `lib/`: ライブラリのソースコードが格納されます。
  - `constants.ts`: 許可されたHTMLタグ、属性、CSSプロパティ、スキームなどの定数が定義されています。
  - `main.ts`: HTMLエスケープ処理の主要なロジックが実装されています。
  - `main.test.ts`: ユニットテストが実装されています。
- `examples/`: ライブラリの使用例が格納されています。
  - `escape.ts`: HTMLエスケープの具体的な使用例が記述されています。
- `vite.config.ts`: Viteの設定ファイルです。
- `package.json`: プロジェクトの依存関係やスクリプトが定義されています。
- `README.md`: プロジェクトの概要や使用方法が記述されています。
- `tsconfig.json`: TypeScriptの設定ファイルです。

## 開発時の注意点

- HTMLエスケープ処理のロジックは `lib/main.ts` に実装されています。
- 許可されたHTMLタグ、属性、CSSプロパティ、スキームは `lib/constants.ts` で定義されています。
- 新しいHTMLタグや属性を許可する場合は、`lib/constants.ts` を修正する必要があります。
- エスケープ処理が既存のHTML構造を破壊しないように注意してください。
- `escapeHtml` メソッドは、HTML文字列全体をエスケープします。
- `escapeTag` メソッドは、HTMLタグをエスケープします。
- Markdown-itプラグインとして使用する場合は、`markdownItPlugin` メソッドを使用します。
- テストは `jest` で実行できます。
- コードのフォーマットは `xo` と `prettier` で実行できます。
- ビルドは `vite` で実行できます。
