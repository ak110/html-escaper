import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'htmlEscaper',
      fileName: 'html-escaper',
      formats: ['cjs'],
    },
    outDir: 'dist',
    sourcemap: true,
  },
});
