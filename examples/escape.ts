import { JSDOM } from "jsdom"
import HtmlEscaper from "../lib/main.js"

// DOMParserとNodeをグローバルに設定
const dom = new JSDOM()
globalThis.DOMParser = dom.window.DOMParser
globalThis.Node = dom.window.Node

const escaper = new HtmlEscaper()
const dirtyHtml = `
<div onclick="alert('XSS')">
  <script src="evil.js">
    malicious code
  </script>
  <p style="color: red; font-size: 16px;">Hello <b>World</b></p>
  <img src=. onerror=alert('XSS')>
</div>
`
const cleanHtml = escaper.escapeHtml(dirtyHtml)

console.info("Dirty HTML Code:", dirtyHtml)

console.info("Clean HTML Code:", cleanHtml)
