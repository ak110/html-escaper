# HTML Escaper - Copilot Instructions

このドキュメントには、プロジェクトの保守と開発に関する重要な注意点を記録します。

## プロジェクト構成のポイント

### 依存関係管理

1. **依存関係の分類**

   - `devDependencies`: 開発時のみ必要なパッケージ（ビルドツール、テストライブラリ、型定義など）
   - `dependencies`: 実行時に必要なパッケージ
   - `optionalDependencies`: 基本的に使用を避け、代わりにdevDependenciesかdependenciesを使用

### TypeScript設定

1. **型定義ファイル生成**

   ```json
   {
     "declaration": true,
     "emitDeclarationOnly": true,
     "declarationDir": "./"
   }
   ```

2. **ファイル管理**
   - `include`には実際に存在するディレクトリのみを指定
   - 設定ファイル（vite.config.tsなど）も必要に応じてincludeに含める
   - `exclude`で`node_modules`と`dist`を除外

### ビルド設定

1. **Vite**

   - ライブラリモードでビルド
   - ES ModulesとCommonJSの両方のフォーマットをサポート
   - ソースマップを生成

2. **Jest**
   - ESMサポートを有効化
   - ts-jestでTypeScriptをサポート
   - jsdomテスト環境を使用

## レビューポイント

プロジェクト構成をレビューする際は、以下の点を確認：

1. **依存関係の適切な分類**

   - 各パッケージが適切なカテゴリ（dev/prod）に分類されているか
   - 不要な依存関係が含まれていないか

2. **TypeScript設定の整合性**

   - プロジェクト構造と`include`/`exclude`パターンの一致
   - 型定義ファイルの生成設定
   - モジュール解決の設定

3. **ビルド設定の妥当性**

   - 出力フォーマットの設定
   - ソースマップの生成
   - 最適化設定

4. **パッケージ設定の確認**
   - package.jsonのexports設定
   - mainとmoduleフィールドの設定
   - typesフィールドの設定
