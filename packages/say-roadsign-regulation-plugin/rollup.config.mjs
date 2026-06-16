import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { Addon } from '@embroider/addon-dev/rollup';

import sass from 'rollup-plugin-sass';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'postcss';
import path from 'path';
import autoprefixer from 'autoprefixer';
import rollupDeclarationsPlugin from './rollup-plugins/declarations.mjs';

const nodeResolvePlugin = nodeResolve({
  preferBuiltins: false,
  mainFields: ['module', 'jsnext:main', 'browser', 'main'],
  extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.scss'],
});
const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default [
  {
    input: './_index.scss',
    output: {
      file: './vendor/say-roadsign-regulation-plugin.js',
      assetFileNames: '[name][extname]',
    },
    plugins: [
      sass({
        output: './vendor/say-roadsign-regulation-plugin.css',
        options: {
          api: 'modern',
          includePaths: [path.resolve('node_modules')],
          quietDeps: true,
        },
        processor: (css) =>
          postcss([autoprefixer])
            .process(css)
            .then((result) => result.css),
      }),
    ],
  },
  {
    preserveSymlinks: false,
    onwarn: (message, defaultHandler) => {
      // fail build if circular dependencies are found
      if (
        message.code === 'CIRCULAR_DEPENDENCY' &&
        !(message.ids && message.ids.every((id) => id.includes('node_modules')))
      ) {
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
      json(),

      // These are the modules that users should be able to import from your
      // addon. Anything not listed here may get optimized away.
      // By default all your JavaScript modules (**/*.js) will be importable.
      // But you are encouraged to tweak this to only cover the modules that make
      // up your addon's public API. Also make sure your package.json#exports
      // is aligned to the config here.
      // See https://github.com/embroider-build/embroider/blob/main/docs/v2-faq.md#how-can-i-define-the-public-exports-of-my-addon
      addon.publicEntrypoints([
        'index.js',
        'styles.js',
        '**/*.js',
        '**/*.ts',
        'template-registry.js',
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
      commonjs(),

      nodeResolvePlugin,

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
      rollupDeclarationsPlugin(
        'declarations',
        'pnpm ember-tsc --build --declaration --emitDeclarationOnly',
      ),

      // addons are allowed to contain imports of .css files, which we want rollup
      // to leave alone and keep in the published output.
      addon.keepAssets(['**/*.css']),

      // Remove leftover build artifacts when starting a new build.
      addon.clean(),

      // Copy Readme and License into published package
      copy({
        targets: [
          { src: '../../README.md', dest: '.' },
          { src: '../../LICENSE.md', dest: '.' },
        ],
      }),
    ],
  },
];
