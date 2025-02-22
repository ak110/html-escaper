export class HtmlEscaper {
  // エスケープ対象のタグ（小文字で指定）
  private allowedTags: string[] = [
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "b",
    "base",
    "basefont",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "br",
    "button",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "command",
    "content",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "i",
    "image",
    "img",
    "input",
    "ins",
    "isindex",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "listing",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "multicol",
    "nav",
    "nobr",
    "noembed",
    "noframes",
    "noscript",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "plaintext",
    "pre",
    "progress",
    "q",
    "rp",
    "s",
    "samp",
    "section",
    "select",
    "shadow",
    "small",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "tt",
    "u",
    "ul",
    "var",
    "wbr",
  ];

  // コンテンツ変換対象のタグ（DIVに変換）
  private contentTagWhitelist: string[] = ["form", "google-sheets-html-origin"];

  // 許可する属性
  private allowedAttributes: { [key: string]: string[] } = {
    "*": ["id", "title", "class", "style"],
    "a": ["href", "alt", "title", "target", "rel"],
    "details": ["open"],
    "img": ["src", "alt", "title", "width", "height"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
    "tr": ["rowspan"],
  };

  // 許可するCSSプロパティ
  private allowedCssStyles: { [key: string]: boolean } = {
    "background-color": true, "color": true, "font-size": true, "font-weight": true,
    "text-align": true, "text-decoration": true, "width": true
  };

  // 許可するスキーム
  private allowedSchemas: string[] = ['http:', 'https:', 'data:', 'm-files:', 'file:', 'ftp:', 'mailto:', 'pw:'];

  // URIが指定できる属性
  private uriAttributes: { [key: string]: boolean } = { "href": true, "action": true };

  private parser: DOMParser = new DOMParser();

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
                if (this.allowedCssStyles[styleName]) {
                  newNode.style.setProperty(styleName, element.style.getPropertyValue(styleName));
                }
              }
            } else {
              // URI属性の場合、スキームのチェック
              if (this.uriAttributes[attr.name]) {
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

  public getAllowedTags(): string[] {
    return this.allowedTags;
  }
  public getAllowedAttributes(): { [key: string]: string[] } {
    return this.allowedAttributes;
  }
  public getAllowedCssStyles(): { [key: string]: boolean } {
    return this.allowedCssStyles;
  }
  public getAllowedSchemas(): string[] {
    return this.allowedSchemas;
  }
}
