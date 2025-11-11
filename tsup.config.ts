import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'], // or ['esm'] with proper config
  platform: 'node',
  outDir: 'dist',
  clean: true,
  bundle: true,
  minify: false,
  sourcemap: true,
});
