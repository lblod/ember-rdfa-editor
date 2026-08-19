import { defineConfig } from 'vite';
import { extensions, ember, contentFor } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import yaml from '@modyfi/vite-plugin-yaml';

import fs from 'fs';

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (_err) {
    return false;
  }
}
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@lblod/ember-rdfa-editor/_app_/modifiers/leave-with-arrow-keys.gts',
        replacement:
          '@lblod/ember-rdfa-editor/modifiers/leave-with-arrow-keys.ts',
      },
      {
        find: '@lblod/ember-rdfa-editor/_app_/modifiers/leave-on-enter-key.gts',
        replacement: '@lblod/ember-rdfa-editor/modifiers/leave-on-enter-key.ts',
      },
    ],
    conditions: [
      'module',
      'browser',
      'development|production',
      '@say-editor/development',
    ],
    dedupe: [
      '@lblod/ember-rdfa-editor',
      '@lblod/say-roadsign-regulation-plugin',
      '@lblod/say-ar-design-plugin',
    ],
  },
  optimizeDeps: {
    exclude: [
      '@lblod/ember-rdfa-editor',
      '@lblod/say-roadsign-regulation-plugin',
      '@lblod/say-ar-design-plugin',
    ],
  },
  // server: {
  //   warmup: {
  //     clientFiles: [
  //       // Start bundling some code before any requests are actually made, since we will need this
  //       './app/routes/application.ts',
  //       './app/templates/application.gts',
  //     ],
  //   },
  // },
  plugins: [
    yaml(),
    contentFor(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    {
      name: 'custom-resolve',
      async resolveId(id, parent, options) {
        console.log('id', id);
        if (id.startsWith('@lblod/ember-rdfa-editor/')) {
          const path = id.substring(25);
          console.log('path', path);
          if (fileExists(`../packages/ember-rdfa-editor/src/${path}.gts`)) {
            console.log('caught');
            return `../packages/ember-rdfa-editor/src/${path}.gts`;
          }
          if (fileExists(`../packages/ember-rdfa-editor/src/${path}.ts`)) {
            console.log('caught');
            return `../packages/ember-rdfa-editor/src/${path}.ts`;
          }
          return null;
        }
        return null;
      },
    },
    // {
    //   name: 'watch-node-modules',
    //   configureServer: (server) => {
    //     server.watcher.options = {
    //       ...server.watcher.options,
    //       ignored: ['**/.git/**'],
    //     };
    //   },
    // },
  ],
});
