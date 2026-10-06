import { defineConfig } from 'vite';
import ruby from 'vite-plugin-ruby';
import vue from '@vitejs/plugin-vue';
import { aliases, vueOptions } from './vite.shared';
import yaml from '@rollup/plugin-yaml';

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

export default defineConfig({
  plugins: [ruby(), vue(vueOptions), yaml()],
  server: {
    // Rails in Docker tells the browser to load scripts from this host.
    allowedHosts: ['host.docker.internal', 'localhost', '127.0.0.1'],
    ...(usePolling
      ? {
          watch: { usePolling: true, interval: 300 },
          hmr: { clientPort: 3036 },
        }
      : {}),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: { alias: aliases },
});
