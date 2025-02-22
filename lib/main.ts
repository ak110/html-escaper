import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_CONTENT_TAGS,
  ALLOWED_CSS_STYLES,
  ALLOWED_SCHEMAS,
  ALLOWED_TAGS,
  URI_ATTRIBUTES
} from "./constants";

import { makeEscapedCopy, startsWithAny } from "./escaper";

export class HtmlEscaper {
  // エスケープ対象のタグ（小文字で指定）
  private allowedTags: string[] = [...ALLOWED_TAGS];

  // コンテンツ変換対象のタグ（DIVに変換）
  private allowedContentTags: string[] = [...ALLOWED_CONTENT_TAGS];

  // 許可する属性
  private allowedAttributes: { [key: string]: string[] } = { ...ALLOWED_ATTRIBUTES };

  // 許可するCSSプロパティ
  private allowedCssStyles: string[] = [...ALLOWED_CSS_STYLES];

  // 許可するスキーム
  private allowedSchemas: string[] = [...ALLOWED_SCHEMAS];

  // URIが指定できる属性
  private uriAttributes: string[] = [...URI_ATTRIBUTES];

  private parser: DOMParser = new DOMParser();

  public getAllowedTags(): string[] {
    return this.allowedTags;
  }
  public getAllowedAttributes(): { [key: string]: string[] } {
    return this.allowedAttributes;
  }
  public getAllowedCssStyles(): string[] {
    return this.allowedCssStyles;
  }
  public getAllowedSchemas(): string[] {
    return this.allowedSchemas;
  }

  /**
   * HTML文字列をエスケープします。
   * @param input 入力HTML文字列
   * @param extraSelector 追加で許可するセレクタ（任意）
   * @returns エスケープ後のHTML文字列
   */
  public escapeHtml(input: string, extraSelector?: string): string {
    input = input.trim();
    if (input === "") return "";
    if (input === "<br>") return "";

    // <body>が存在しない場合は補完
    if (input.indexOf("<body") === -1) {
      input = `<body>${input}</body>`;
    }
    const doc: Document = this.parser.parseFromString(input, "text/html");
    
    const fragment = doc.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach(node => {
      const processed = makeEscapedCopy(node, doc,
        this.allowedTags, this.allowedContentTags, this.allowedAttributes, this.allowedCssStyles,
        this.allowedSchemas, this.uriAttributes,
        extraSelector);
      if (processed) {
        fragment.appendChild(processed);
      }
    });

    const container: HTMLElement = doc.createElement("div");
    container.appendChild(fragment);
    const resultHtml = container.innerHTML;
    // 改行等の調整（必要に応じて調整してください）
    return resultHtml.replace(/<br[^>]*>(\S)/g, "<br>\n$1")
                     .replace(/div><div/g, "div>\n<div");
  }

  /**
   * 単一のHTMLタグ/閉じタグを前提にエスケープします。
   * @param input 入力HTMLタグ文字列
   * @returns エスケープ後のHTML文字列
   */
  public escapeTag(input: string): string {
    // 空文字列チェック
    input = input.trim();
    if (input === "") return "";

    // 終了タグの処理 (例: </script>)
    if (input.includes("</")) {
      const match = input.match(/<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/);
      if (match) {
        const tagName = match[1].toLowerCase();
        return this.allowedTags.includes(tagName)
          ? `</${tagName}>`
          : input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }

    // DOMParserでタグをパース
    const doc = this.parser.parseFromString(`<body>${input}</body>`, "text/html");
    const element = doc.body.firstElementChild as HTMLElement;
    
    // タグが存在しない場合は入力をそのまま返す
    if (!element) return input;

    const tagName = element.tagName.toLowerCase();

    // 許可されていないタグはすべてエスケープする
    if (!this.allowedTags.includes(tagName)) {
      return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // 新しい要素を作成
    const newElement = doc.createElement(tagName);

    // 属性の処理
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const attrName = attr.name.toLowerCase();
      
      if (this.allowedAttributes[tagName]?.includes(attrName) || 
          this.allowedAttributes["*"]?.includes(attrName)) {
        
        if (attr.name === "style") {
          // style属性の処理
          for (let s = 0; s < element.style.length; s++) {
            const styleName = element.style[s];
            if (this.allowedCssStyles.includes(styleName)) {
              newElement.style.setProperty(
                styleName, 
                element.style.getPropertyValue(styleName)
              );
            }
          }
        } else if (this.uriAttributes.includes(attr.name)) {
          // URI属性の処理
          if (!attr.value.includes(":") || 
              startsWithAny(attr.value, this.allowedSchemas)) {
            newElement.setAttribute(attr.name, attr.value);
          }
        } else {
          newElement.setAttribute(attr.name, attr.value);
        }
      }
    }

    // テキストコンテンツの処理
    if (element.textContent) {
      newElement.textContent = element.textContent;
    }

    // 空要素の場合は終了タグを省略
    const html = newElement.outerHTML;
    if (element.children.length === 0 && !element.textContent) {
      return html.replace(/<([^>]+)><\/[^>]+>/, '<$1>');
    }
    return html;
  }
}
