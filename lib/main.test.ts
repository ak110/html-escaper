import MarkdownIt from "markdown-it"
import HtmlEscaper from "./main.js"

describe("HtmlEscaper", () => {
  let escaper: HtmlEscaper

  beforeEach(() => {
    escaper = new HtmlEscaper()
  })

  describe("Getters", () => {
    it("許可されたタグのリストを取得できる", () => {
      const tags = escaper.getAllowedTags()
      expect(Array.isArray(tags)).toBe(true)
      expect(tags.includes("p")).toBe(true)
      expect(tags.includes("div")).toBe(true)
    })

    it("許可された属性のリストを取得できる", () => {
      const attributes = escaper.getAllowedAttributes()
      expect(Array.isArray(attributes["*"])).toBe(true)
      expect(Array.isArray(attributes.a)).toBe(true)
      expect(attributes["*"]).toContain("class")
      expect(attributes.a).toContain("href")
    })

    it("許可されたCSSスタイルのリストを取得できる", () => {
      const styles = escaper.getAllowedCssStyles()
      expect(styles.includes("color")).toBe(true)
      expect(styles.includes("background-color")).toBe(true)
    })

    it("許可されたスキーマのリストを取得できる", () => {
      const schemas = escaper.getAllowedSchemas()
      expect(schemas.includes("https:")).toBe(true)
      expect(schemas.includes("http:")).toBe(true)
    })
  })

  describe("escapeHtml", () => {
    it("空文字列を正しく処理する", () => {
      expect(escaper.escapeHtml("")).toBe("")
    })

    it("基本的なHTMLエスケープを行う", () => {
      const input = '<script>alert("xss")</script>'
      const output = escaper.escapeHtml(input)
      expect(output).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    })

    it("許可されたタグと属性を保持する", () => {
      const input = '<p style="color: red;">Hello <b>World</b></p>'
      const output = escaper.escapeHtml(input)
      expect(output).toContain('<p style="color: red;">')
      expect(output).toContain("<b>")
      expect(output).toContain("</b>")
    })

    it("不正なスタイル属性を除去する", () => {
      const input = '<p style="color: red; expression(alert(1));">Test</p>'
      const output = escaper.escapeHtml(input)
      expect(output).toContain("color: red")
      expect(output).not.toContain("expression")
    })

    it("不正なスキーマを含むURLを除去する", () => {
      const input = '<a href="javascript:alert(1)">Click me</a>'
      const output = escaper.escapeHtml(input)
      expect(output).toBe("<a>Click me</a>")
    })

    it("許可されたスキーマを含むURLを保持する", () => {
      const input = '<a href="https://example.com">Safe link</a>'
      const output = escaper.escapeHtml(input)
      expect(output).toContain('href="https://example.com"')
    })

    // @todo 難易度高いため実装保留中
    it.skip("閉じていないタグを適切に処理する", () => {
      const input = '<span style="color:red">赤文字<script>window.alert(1)'
      const output = escaper.escapeHtml(input)
      expect(output).toBe('<span style="color: red;">赤文字&lt;script&gt;window.alert(1)')
    })
    it.skip("閉じタグのみを適切に処理する", () => {
      const input = "通常文字</span></script>"
      const output = escaper.escapeHtml(input)
      expect(output).toBe("通常文字</span>&lt;/script&gt;")
    })

    it("複雑なHTML構造を適切に処理する", () => {
      const input = `
        <div class="container" style="background-color: #fff;">
          <p onclick="alert(1)" style="color: blue;">
            <b>Hello</b>
            <script>alert(2)</script>
            <img src="image.jpg" onerror=alert(3)>
            <span style='color: red'>あいうえお</span>
          </p>
        </div>
      `
      const output = escaper.escapeHtml(input)

      // 許可された属性とスタイルが保持される
      expect(output).toContain('<div class="container" style="background-color: rgb(255, 255, 255);">')
      expect(output).toContain('<p style="color: blue;">')
      expect(output).toContain('<span style="color: red;">')

      // 不正なイベントハンドラが除去される
      expect(output).not.toContain("onclick")
      expect(output).not.toContain("onerror")

      // スクリプトタグがエスケープされる
      expect(output).toContain("&lt;script&gt;")
    })

    it("エッジケース", () => {
      expect(escaper.escapeHtml("")).toBe("")
      expect(escaper.escapeHtml("ゎ")).toBe("ゎ")
      expect(escaper.escapeHtml("<br />")).toBe("<br>")
      expect(escaper.escapeHtml("<!-- -->")).toBe("")
    })
  })

  describe("escapeTag", () => {
    it("許可されているタグをエスケープしない", () => {
      expect(escaper.escapeTag("<span>")).toBe("<span>")
      expect(escaper.escapeTag("</span>")).toBe("</span>")
    })

    it("許可されていないタグをエスケープする", () => {
      expect(escaper.escapeTag("<script>")).toBe("&lt;script&gt;")
      expect(escaper.escapeTag("</script>")).toBe("&lt;/script&gt;")
    })

    it("有効な属性を保持しながら悪意のある属性を無効化する", () => {
      expect(escaper.escapeTag('<span style="color: red;" onclick="alert(1)">')).toBe('<span style="color: red;">')
    })

    it("imgタグを正しく処理する", () => {
      expect(escaper.escapeTag('<img src="x" onerror="alert(1)">')).toBe('<img src="x">')
    })

    it("悪意のあるURLを無効化する", () => {
      expect(escaper.escapeTag('<a href="javascript:alert(1)">')).toBe("<a>")
      expect(escaper.escapeTag('<a href="http://example.com">')).toBe('<a href="http://example.com">')
    })

    it("許可されたスタイルを保持する", () => {
      expect(escaper.escapeTag('<span style="color: red; font-size: 12px; position: absolute;">')).toBe(
        '<span style="color: red; font-size: 12px;">'
      )
    })

    it("エッジケース", () => {
      expect(escaper.escapeTag("")).toBe("")
      expect(escaper.escapeTag("ゎ")).toBe("ゎ")
      expect(escaper.escapeTag("<br />")).toBe("<br>")
      // Expect(escaper.escapeTag("<!-- -->")).toBe("")
    })
  })

  describe("markdownItPlugin", () => {
    it("MarkdownItのプラグインとして使用できる", () => {
      const md = new MarkdownIt()
      md.use(escaper.markdownItPlugin())

      const input = `
# MarkdownIt XSS Test

- [Click me](javascript:alert(1))
- [Safe link](https://example.com)
- <script>alert(2)</script>
- <span style="color: red;">あいうえお</span>

<script>alert(3)</script>

<details>
  <summary>Details</summary>
  <img src="image.jpg" onerror=alert(3)>
</details>
      `
      const output = md.render(input)

      // 許可されたタグと属性が保持される
      expect(output).toContain("<h1>MarkdownIt XSS Test</h1>")
      expect(output).toContain('<a href="https://example.com">Safe link</a>')
      expect(output).toContain('<span style="color: red;">あいうえお</span>')
      expect(output).toContain("<details>")
      expect(output).toContain("<summary>Details</summary>")
      expect(output).toContain('<img src="image.jpg">')

      // 不正なタグがエスケープされる
      expect(output).toContain("&lt;script&gt;alert(2)&lt;/script&gt;")
      expect(output).toContain("&lt;script&gt;alert(3)&lt;/script&gt;")
    })
  })
})
