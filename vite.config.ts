import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'HtmlEscaper',
      formats: ['es'],
      fileName: 'html-escaper'
    },
    sourcemap: true,
    target: 'esnext'
  }
})
