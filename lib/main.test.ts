import { HtmlEscaper } from './main';

describe('HtmlEscaper', () => {
  let escaper: HtmlEscaper;

  beforeEach(() => {
    escaper = new HtmlEscaper();
  });

  describe('escapeHtml', () => {
    it('空文字列を正しく処理する', () => {
      expect(escaper.escapeHtml('')).toBe('');
    });

    it('基本的なHTMLエスケープを行う', () => {
      const input = '<script>alert("xss")</script>';
      const output = escaper.escapeHtml(input);
      expect(output).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('許可されたタグと属性を保持する', () => {
      const input = '<p style="color: red;">Hello <b>World</b></p>';
      const output = escaper.escapeHtml(input);
      expect(output).toContain('<p style="color: red;">');
      expect(output).toContain('<b>');
      expect(output).toContain('</b>');
    });

    it('不正なスタイル属性を除去する', () => {
      const input = '<p style="color: red; expression(alert(1));">Test</p>';
      const output = escaper.escapeHtml(input);
      expect(output).toContain('color: red');
      expect(output).not.toContain('expression');
    });

    it('不正なスキーマを含むURLを除去する', () => {
      const input = '<a href="javascript:alert(1)">Click me</a>';
      const output = escaper.escapeHtml(input);
      expect(output).toBe('<a>Click me</a>');
    });

    it('許可されたスキーマを含むURLを保持する', () => {
      const input = '<a href="https://example.com">Safe link</a>';
      const output = escaper.escapeHtml(input);
      expect(output).toContain('href="https://example.com"');
    });

    // @todo 難易度高いため実装保留中
    it.skip('閉じていないタグを適切に処理する', () => {
      const input = '<span style="color:red">赤文字<script>window.alert(1)';
      const output = escaper.escapeHtml(input);
      expect(output).toBe('<span style="color: red;">赤文字&lt;script&gt;window.alert(1)');
    });
    it.skip('閉じタグのみを適切に処理する', () => {
      const input = '通常文字</span></script>';
      const output = escaper.escapeHtml(input);
      expect(output).toBe('通常文字</span>&lt;/script&gt;');
    });

    it('複雑なHTML構造を適切に処理する', () => {
      const input = `
        <div class="container" style="background-color: #fff;">
          <p onclick="alert(1)" style="color: blue;">
            <b>Hello</b>
            <script>alert(2)</script>
            <img src="image.jpg" onerror=alert(3)>
            <span style='color: red'>あいうえお</span>
          </p>
        </div>
      `;
      const output = escaper.escapeHtml(input);
      
      // 許可された属性とスタイルが保持される
      expect(output).toContain('<div class="container" style="background-color: rgb(255, 255, 255);">');
      expect(output).toContain('<p style="color: blue;">');
      expect(output).toContain('<span style="color: red;">');
      
      // 不正なイベントハンドラが除去される
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('onerror');
      
      // スクリプトタグがエスケープされる
      expect(output).toContain('&lt;script&gt;');
    });
  });

  describe('Getters', () => {
    it('許可されたタグのリストを取得できる', () => {
      const tags = escaper.getAllowedTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.includes('p')).toBe(true);
      expect(tags.includes('div')).toBe(true);
    });

    it('許可された属性のリストを取得できる', () => {
      const attrs = escaper.getAllowedAttributes();
      expect(Array.isArray(attrs['*'])).toBe(true);
      expect(Array.isArray(attrs['a'])).toBe(true);
      expect(attrs['*']).toContain('class');
      expect(attrs['a']).toContain('href');
    });

    it('許可されたCSSスタイルのリストを取得できる', () => {
      const styles = escaper.getAllowedCssStyles();
      expect(styles.includes('color')).toBe(true);
      expect(styles.includes('background-color')).toBe(true);
    });

    it('許可されたスキーマのリストを取得できる', () => {
      const schemas = escaper.getAllowedSchemas();
      expect(schemas.includes('https:')).toBe(true);
      expect(schemas.includes('http:')).toBe(true);
    });
  });
});
