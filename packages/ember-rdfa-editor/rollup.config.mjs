import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { Addon } from '@embroider/addon-dev/rollup';

import sassPlugin from 'rollup-plugin-sass';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import * as sass from 'sass';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});
export default {
  onwarn: (message, defaultHandler) => {
    // fail build if circular dependencies are found
    if (message.code === 'CIRCULAR_DEPENDENCY') {
      console.error(message);
      process.exit(-1);
    } else {
      defaultHandler(message);
    }
  },
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  output: addon.output(),

  plugins: [
    nodeResolve({ preferBuiltins: false }),
    json(),

    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    // By default all your JavaScript modules (**/*.js) will be importable.
    // But you are encouraged to tweak this to only cover the modules that make
    // up your addon's public API. Also make sure your package.json#exports
    // is aligned to the config here.
    // See https://github.com/embroider-build/embroider/blob/main/docs/v2-faq.md#how-can-i-define-the-public-exports-of-my-addon
    addon.publicEntrypoints([
      '**/*.js',
      '**/*.ts',
      'index.js',
      'template-registry.js',
      'webpack-config.js',
    ]),

    // These are the modules that should get reexported into the traditional
    // "app" tree. Things in here should also be in publicEntrypoints above, but
    // not everything in publicEntrypoints necessarily needs to go here.
    addon.appReexports([
      'components/**/*.js',
      'helpers/**/*.js',
      'modifiers/**/*.js',
      'services/**/*.js',
    ]),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // This babel config should *not* apply presets or compile away ES modules.
    // It exists only to provide development niceties for you, like automatic
    // template colocation.
    //
    // By default, this will load the actual babel config from the file
    // babel.config.json.
    babel({
      extensions: ['.js', '.gjs', '.ts', '.gts'],
      babelHelpers: 'bundled',
    }),

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // Ensure that .gjs files are properly integrated as Javascript
    addon.gjs(),

    // Emit .d.ts declaration files
    addon.declarations('declarations'),

    // addons are allowed to contain imports of .css files, which we want rollup
    // to leave alone and keep in the published output.
    addon.keepAssets(['**/*.css']),

    // Remove leftover build artifacts when starting a new build.
    addon.clean(),
    sassPlugin({
      include: ['**/*.scss'],
      insert: true,
      api: 'modern',
      options: {
        importers: [new sass.NodePackageImporter()],
        style: 'compressed',
      },
    }),

    // Copy Readme and License into published package
    copy({
      targets: [
        { src: '../../README.md', dest: '.' },
        { src: '../../LICENSE.md', dest: '.' },
      ],
    }),
  ],
};
