import constants from "./constants.js"

export class HtmlEscaper {
  // エスケープ対象のタグ（小文字で指定）
  private readonly allowedTags: string[] = [...constants.allowedTags]

  // コンテンツ変換対象のタグ（DIVに変換）
  private readonly allowedContentTags: string[] = [...constants.allowedContentTags]

  // 許可する属性
  private readonly allowedAttributes: Record<string, string[]> = {
    ...constants.allowedAttributes,
  }

  // 許可するCSSプロパティ
  private readonly allowedCssStyles: string[] = [...constants.allowedCssStyles]

  // 許可するスキーム
  private readonly allowedSchemas: string[] = [...constants.allowedSchemas]

  // URIが指定できる属性
  private readonly uriAttributes: string[] = [...constants.uriAttributes]

  private readonly parser: DOMParser = new DOMParser()

  public getAllowedTags(): string[] {
    return this.allowedTags
  }

  public getAllowedAttributes(): Record<string, string[]> {
    return this.allowedAttributes
  }

  public getAllowedCssStyles(): string[] {
    return this.allowedCssStyles
  }

  public getAllowedSchemas(): string[] {
    return this.allowedSchemas
  }

  /**
   * HTML文字列をエスケープします。
   * @param input 入力HTML文字列
   * @param extraSelector 追加で許可するセレクタ（任意）
   * @returns エスケープ後のHTML文字列
   */
  public escapeHtml(input: string, extraSelector?: string): string {
    input = input.trim()
    if (input === "") return ""
    if (input === "<br>") return ""

    // <body>が存在しない場合は補完
    if (!input.includes("<body")) {
      input = `<body>${input}</body>`
    }

    const document: Document = this.parser.parseFromString(input, "text/html")

    const fragment = document.createDocumentFragment()
    for (const node of Array.from(document.body.childNodes)) {
      const processed = this.makeEscapedCopy(node, document, extraSelector)
      if (processed) {
        fragment.append(processed)
      }
    }

    const container: HTMLElement = document.createElement("div")
    container.append(fragment)
    const resultHtml = container.innerHTML
    // 改行等の調整（必要に応じて調整してください）
    return resultHtml.replaceAll(/<br[^>]*>(\S)/g, "<br>\n$1").replaceAll("div><div", "div>\n<div")
  }

  /**
   * 単一のHTMLタグ/閉じタグを前提にエスケープします。
   * @param input 入力HTMLタグ文字列
   * @returns エスケープ後のHTML文字列
   */
  public escapeTag(input: string): string {
    // 空文字列チェック
    input = input.trim()
    if (input === "") return ""

    // 終了タグの処理 (例: </script>)
    if (input.includes("</")) {
      const match = /<\/([a-zA-Z][a-zA-Z\d]*)\s*>/.exec(input)
      if (match) {
        const tagName = match[1].toLowerCase()
        return this.allowedTags.includes(tagName) ? `</${tagName}>` : input.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      }
    }

    // DOMParserでタグをパース
    const document = this.parser.parseFromString(`<body>${input}</body>`, "text/html")
    const element = document.body.firstElementChild as HTMLElement

    // タグが存在しない場合は入力をそのまま返す
    if (!element) return input

    const tagName = element.tagName.toLowerCase()

    // 許可されていないタグはすべてエスケープする
    if (!this.allowedTags.includes(tagName)) {
      return input.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    }

    // 新しい要素を作成
    const newElement = document.createElement(tagName)

    // 属性の処理
    for (const attribute of Array.from(element.attributes)) {
      const attributeName = attribute.name.toLowerCase()

      if (this.allowedAttributes[tagName]?.includes(attributeName) || this.allowedAttributes["*"]?.includes(attributeName)) {
        if (attribute.name === "style") {
          // Style属性の処理
          for (const styleName of Array.from(element.style)) {
            if (this.allowedCssStyles.includes(styleName)) {
              newElement.style.setProperty(styleName, element.style.getPropertyValue(styleName))
            }
          }
        } else if (this.uriAttributes.includes(attribute.name)) {
          // URI属性の処理
          if (!attribute.value.includes(":") || this.startsWithAny(attribute.value, this.allowedSchemas)) {
            newElement.setAttribute(attribute.name, attribute.value)
          }
        } else {
          newElement.setAttribute(attribute.name, attribute.value)
        }
      }
    }

    // テキストコンテンツの処理
    if (element.textContent) {
      newElement.textContent = element.textContent
    }

    // 空要素の場合は終了タグを省略
    const html = newElement.outerHTML
    if (element.children.length === 0 && !element.textContent) {
      return html.replace(/<([^>]+)><\/[^>]+>/, "<$1>")
    }

    return html
  }

  /**
   * ノードをエスケープしたコピーに変換します。
   * @param node 対象ノード
   * @param doc DOM(Document)
   * @param extraSelector 追加で許可するセレクタ（任意）
   * @returns エスケープ済みのノード
   */
  private makeEscapedCopy(node: Node, document: Document, extraSelector?: string): Node {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true)
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element: HTMLElement = node as HTMLElement
      // タグが許可リスト、もしくは追加セレクタにマッチしている場合
      const tagName: string = element.tagName.toLowerCase()
      if (
        this.allowedTags.includes(tagName) ||
        this.allowedContentTags.includes(tagName) ||
        (extraSelector && element.matches(extraSelector))
      ) {
        // AllowedContentTagsの対象タグはDIVに変換
        const newNode: HTMLElement = document.createElement(this.allowedContentTags.includes(tagName) ? "div" : tagName)

        // 属性の処理
        for (const attribute of Array.from(element.attributes)) {
          const attributeName = attribute.name.toLowerCase()
          if (
            this.allowedAttributes[tagName]?.includes(attributeName) ||
            this.allowedAttributes["*"]?.includes(attributeName)
          ) {
            if (attribute.name === "style") {
              // Style属性内は許可するCSSプロパティのみ
              for (const styleName of Array.from(element.style)) {
                if (this.allowedCssStyles.includes(styleName)) {
                  newNode.style.setProperty(styleName, element.style.getPropertyValue(styleName))
                }
              }
            } else {
              // URI属性の場合、スキームのチェック
              if (
                this.uriAttributes.includes(attribute.name) &&
                attribute.value.includes(":") &&
                !this.startsWithAny(attribute.value, this.allowedSchemas)
              ) {
                continue
              }

              newNode.setAttribute(attribute.name, attribute.value)
            }
          }
        }

        // 子要素の再帰処理
        for (const child of Array.from(node.childNodes)) {
          const subCopy: Node = this.makeEscapedCopy(child, document, extraSelector)
          newNode.append(subCopy)
        }

        // 空のspan, b, i, uは削除
        const newNodeTagName = newNode.tagName.toLowerCase()
        if (["span", "b", "i", "u"].includes(newNodeTagName) && newNode.innerHTML.trim() === "") {
          return document.createDocumentFragment()
        }

        return newNode
      }

      // Scriptなどの不正なタグの場合はエスケープしたテキストノードにする
      return document.createTextNode(element.outerHTML)
    }

    // テキスト、コメントその他は空のフラグメントとして返す
    return document.createDocumentFragment()
  }

  /**
   * 指定した文字列が任意の文字列で始まるか判定します。
   * @param str 判定対象文字列
   * @param substrings 判定する文字列群
   * @returns 任意の文字列で始まっていればtrue
   */
  private startsWithAny(string_: string, substrings: string[]): boolean {
    for (const sub of substrings) {
      if (string_.startsWith(sub)) {
        return true
      }
    }

    return false
  }
}
