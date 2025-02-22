
/**
 * ノードをエスケープしたコピーに変換します。
 * @param node 対象ノード
 * @param doc DOM(Document)
 * @param extraSelector 追加で許可するセレクタ（任意）
 * @returns エスケープ済みのノード
 */
export function makeEscapedCopy(node: Node, doc: Document,
    allowedTags: string[],
    allowedContentTags: string[],
    allowedAttributes: { [key: string]: string[] },
    allowedCssStyles: string[],
    allowedSchemas: string[],
    uriAttributes: string[],
    extraSelector?: string): Node {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element: HTMLElement = node as HTMLElement;
      // タグが許可リスト、もしくは追加セレクタにマッチしている場合
      const tagName: string = element.tagName.toLowerCase();
      if (allowedTags.includes(tagName) ||
          allowedContentTags.includes(tagName) ||
          (extraSelector && element.matches(extraSelector))) {
        let newNode: HTMLElement;
        if (allowedContentTags.includes(tagName)) {
          newNode = doc.createElement("div"); // 対象タグはDIVに変換
        } else {
          newNode = doc.createElement(tagName);
        }
        // 属性の処理
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          const attrName = attr.name.toLowerCase();
          if (
            allowedAttributes[tagName]?.includes(attrName) ||
            allowedAttributes["*"]?.includes(attrName)) {
            if (attr.name === "style") {
              // style属性内は許可するCSSプロパティのみ
              for (let s = 0; s < element.style.length; s++) {
                const styleName = element.style[s];
                if (allowedCssStyles.includes(styleName)) {
                  newNode.style.setProperty(styleName, element.style.getPropertyValue(styleName));
                }
              }
            } else {
              // URI属性の場合、スキームのチェック
              if (uriAttributes.includes(attr.name)) {
                if (attr.value.indexOf(":") > -1 && !startsWithAny(attr.value, allowedSchemas)) {
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
          const subCopy: Node = makeEscapedCopy(child, doc, allowedTags, allowedContentTags, allowedAttributes, allowedCssStyles, allowedSchemas, uriAttributes, extraSelector);
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
  export function startsWithAny(str: string, substrings: string[]): boolean {
    for (const sub of substrings) {
      if (str.indexOf(sub) === 0) {
        return true;
      }
    }
    return false;
  }
