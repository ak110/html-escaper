declare class HtmlEscaper {
  /**
   * HTML文字列をエスケープします。
   * @param input 入力HTML文字列
   * @param extraSelector 追加で許可するセレクタ（任意）
   * @returns エスケープ後のHTML文字列
   */
  escapeHtml(input: string, extraSelector?: string): string;

  /**
   * 許可されているHTMLタグの一覧を取得します。
   * @returns 許可されているタグの配列
   */
  getAllowedTags(): string[];

  /**
   * 許可されている属性の一覧を取得します。
   * @returns タグごとの許可属性のマップ
   */
  getAllowedAttributes(): { [key: string]: string[] };

  /**
   * 許可されているCSSスタイルの一覧を取得します。
   * @returns 許可されているCSSプロパティのマップ
   */
  getAllowedCssStyles(): string[];

  /**
   * 許可されているURIスキームの一覧を取得します。
   * @returns 許可されているスキームの配列
   */
  getAllowedSchemas(): string[];
}

export { HtmlEscaper };
