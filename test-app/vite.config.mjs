import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@lblod/ember-rdfa-editor'],
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    {
      name: 'watch-node-modules',
      configureServer: (server) => {
        server.watcher.options = {
          ...server.watcher.options,
          ignored: [
            /node_modules\/(?!@lblod\/ember-rdfa-editor).*/,
            '**/.git/**',
          ],
        };
      },
    },
  ],
});
