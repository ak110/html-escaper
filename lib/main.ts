import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_CONTENT_TAGS,
  ALLOWED_CSS_STYLES,
  ALLOWED_SCHEMAS,
  ALLOWED_TAGS,
  URI_ATTRIBUTES
} from "./constants";

export class HtmlEscaper {
  // エスケープ対象のタグ（小文字で指定）
  private allowedTags: string[] = [...ALLOWED_TAGS];

  // コンテンツ変換対象のタグ（DIVに変換）
  private contentTagWhitelist: string[] = [...ALLOWED_CONTENT_TAGS];

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
      const processed = this.makeEscapedCopy(node, doc, extraSelector);
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
   * ノードをエスケープしたコピーに変換します。
   * @param node 対象ノード
   * @param doc DOM(Document)
   * @param extraSelector 追加で許可するセレクタ（任意）
   * @returns エスケープ済みのノード
   */
  private makeEscapedCopy(node: Node, doc: Document, extraSelector?: string): Node {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element: HTMLElement = node as HTMLElement;
      // タグが許可リスト、もしくは追加セレクタにマッチしている場合
      const tagName: string = element.tagName.toLowerCase();
      if (this.allowedTags.includes(tagName) ||
          this.contentTagWhitelist.includes(tagName) ||
          (extraSelector && element.matches(extraSelector))) {
        let newNode: HTMLElement;
        if (this.contentTagWhitelist.includes(tagName)) {
          newNode = doc.createElement("div"); // 対象タグはDIVに変換
        } else {
          newNode = doc.createElement(tagName);
        }
        // 属性の処理
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          const attrName = attr.name.toLowerCase();
          if (
            this.allowedAttributes[tagName]?.includes(attrName) ||
            this.allowedAttributes["*"]?.includes(attrName)) {
            if (attr.name === "style") {
              // style属性内は許可するCSSプロパティのみ
              for (let s = 0; s < element.style.length; s++) {
                const styleName = element.style[s];
                if (this.allowedCssStyles.includes(styleName)) {
                  newNode.style.setProperty(styleName, element.style.getPropertyValue(styleName));
                }
              }
            } else {
              // URI属性の場合、スキームのチェック
              if (this.uriAttributes.includes(attr.name)) {
                if (attr.value.indexOf(":") > -1 && !this.startsWithAny(attr.value, this.allowedSchemas)) {
                  continue;
                }
              }
              newNode.setAttribute(attr.name, attr.value);
            }
          }
        }
        // 子要素の再帰処理
        for (let i = 0; i < node.childNodes.length; i++) {
          const child: Node = node.childNodes[i];
          const subCopy: Node = this.makeEscapedCopy(child, doc, extraSelector);
          newNode.appendChild(subCopy);
        }
        // 空のspan, b, i, uは削除
        const newNodeTagName = newNode.tagName.toLowerCase();
        if (["span", "b", "i", "u"].includes(newNodeTagName) && newNode.innerHTML.trim() === "") {
          return doc.createDocumentFragment();
        }
        return newNode;
      } else {
        // scriptなどの不正なタグの場合はエスケープしたテキストノードにする
        return doc.createTextNode(element.outerHTML);
      }
    }
    // テキスト、コメントその他は空のフラグメントとして返す
    return doc.createDocumentFragment();
  }

  /**
   * 指定した文字列が任意の文字列で始まるか判定します。
   * @param str 判定対象文字列
   * @param substrings 判定する文字列群
   * @returns 任意の文字列で始まっていればtrue
   */
  private startsWithAny(str: string, substrings: string[]): boolean {
    for (const sub of substrings) {
      if (str.indexOf(sub) === 0) {
        return true;
      }
    }
    return false;
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
              this.startsWithAny(attr.value, this.allowedSchemas)) {
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
