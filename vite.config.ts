import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'HtmlEscaper',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `html-escaper.${format === 'es' ? 'mjs' : format}`
    },
    sourcemap: true,
    target: 'esnext'
  }
})
