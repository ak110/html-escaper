import HtmlEscaper from "../lib/main.js"

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

function escapeHtml(unsafe: string): string {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>HtmlEscaper</h1>
  <h2>Dirty HTML Code</h2>
  <pre style="display: inline-block; border: 1px solid #000; padding: 10px;">${escapeHtml(dirtyHtml)}</pre>
  <h2>Escaped HTML Code</h2>
  <pre style="display: inline-block; border: 1px solid #000; padding: 10px;">${escapeHtml(cleanHtml)}</pre>
  <h2>Raw HTML</h2>
  <div style="display: inline-block; border: 1px solid #000; padding: 10px;">
    ${cleanHtml}
  </div>
`
