/*
 * Hero dock library build.
 *
 *   vite build --config vite.hero-dock.config.ts → public/packs/js/hero-dock.js
 *
 * Kept separate from vite.lib.config.ts because that SDK build inlines one
 * entry. emptyOutDir stays false so this build does not delete sdk.js.
 */
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { defineConfig, type Plugin } from 'vite';
import path from 'path';

const compressedHeroDockPlugin = {
  name: 'compress-hero-dock',
  generateBundle(_options, bundle) {
    const heroBundle = bundle['js/hero-dock.js'];

    if (heroBundle?.type !== 'chunk') {
      this.error('hero-dock bundle was not generated');
    }

    this.emitFile({
      type: 'asset',
      fileName: 'js/hero-dock.js.br',
      source: brotliCompressSync(heroBundle.code, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        },
      }),
    });

    this.emitFile({
      type: 'asset',
      fileName: 'js/hero-dock.js.gz',
      source: gzipSync(heroBundle.code, {
        level: constants.Z_BEST_COMPRESSION,
      }),
    });
  },
} satisfies Plugin;

export default defineConfig({
  plugins: [compressedHeroDockPlugin],
  publicDir: false,
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        dir: 'public/packs',
        entryFileNames: 'js/hero-dock.js',
        inlineDynamicImports: true,
      },
    },
    lib: {
      entry: path.resolve(
        __dirname,
        './app/javascript/entrypoints/hero-dock.js'
      ),
      formats: ['iife'],
      name: 'takehkChatDock',
    },
  },
});
