import { babel } from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import { Addon } from '@embroider/addon-dev/rollup';

import sassPlugin from 'rollup-plugin-sass';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import * as sass from 'sass';
import nodeGlobals from 'rollup-plugin-node-globals';

const nodeResolvePlugin = nodeResolve({
  preferBuiltins: false,
  mainFields: ['module', 'jsnext:main', 'browser', 'main'],
  extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
});
const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});
// an arbitrary string that is not a real module name
const EMPTY_MODULE_ID = '$empty$';
// these are the imports we will replace
const BROWSERIFY_ALIASES = {
  module: EMPTY_MODULE_ID,
  process: 'process',
  crypto: 'crypto-browserify',
  stream: 'stream-browserify',
  vm: EMPTY_MODULE_ID,
};
// an empty shim, for imports we need to replace but which
// don't actually matter for the runtime
const EMPTY_MODULE = 'export default {}';

// rollup plugins are actually fairly simple to understand
// ref: https://rollupjs.org/plugin-development/#resolveid
const browserify = function () {
  return {
    name: 'browserify',
    // resolveId is just a hook that gets called with the string of every import
    // as the "source" argument. the other two args are for advanced stuff, we just
    // need to pass them along
    // It can return a variety of things, but its basically a string or null, the
    // string being the new name of the import, and null if your plugin doesn't care
    resolveId(source, importer, options) {
      if (source in BROWSERIFY_ALIASES) {
        if (BROWSERIFY_ALIASES[source] === EMPTY_MODULE_ID) {
          return EMPTY_MODULE_ID;
        }
        // this.resolve basically lets all the other plugins have a go
        // it skips the plugin that calls it by default so you don't see your
        // own resolve calls see https://rollupjs.org/plugin-development/#this-resolve
        // here we just map the imports to the browserified ones and let the node
        // plugin do the rest
        return this.resolve(BROWSERIFY_ALIASES[source], importer, options);
      }
      if (source === EMPTY_MODULE_ID) return EMPTY_MODULE_ID;
    },
    // load turns a certain id into source code! yes just literally returns
    // a string of javascript!
    // https://rollupjs.org/plugin-development/#load
    load(id) {
      if (id === EMPTY_MODULE_ID) return EMPTY_MODULE;
    },
  };
};
const BUNDLED_DEPS = [
  '@graphy/memory.dataset.fast',
  'crypto-browserify',
  'stream-browserify',
  'process',
];
export default {
  preserveSymlinks: false,
  // TODO: stream-browserify is a mess of circular deps, so I can't let the
  // build fail here anymore. Need to find a better way
  //
  // onwarn: (message, defaultHandler) => {
  //   // fail build if circular dependencies are found
  //   if (message.code === 'CIRCULAR_DEPENDENCY') {
  //     console.error(message);
  //     process.exit(-1);
  //   } else {
  //     defaultHandler(message);
  //   }
  // },
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
      '**/*.js',
      '**/*.ts',
      'index.js',
      'template-registry.js',
      '**/*.scss',
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
    browserify(),

    nodeGlobals(),
    nodeResolvePlugin,

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.

    // basically what this does is mark all our deps as external. So the v2
    // addon is a bundle which still needs to be bundled by your app to get all
    // the deps.
    // Now, for graphy, we actually want to fully bundle that along with our
    // source. So we have to bypass the embroider resolving for it (and its
    // browserified dependencies) so that they get
    // picked up by the combo of the node, commonjs, browserify, and nodeGlobals
    // plugins
    (function () {
      const result = addon.dependencies();
      const resolveId = result.resolveId;
      async function myResolveId(source, importer, options) {
        if (BUNDLED_DEPS.includes(source)) {
          return this.resolve(source, importer, options);
        }
        const result = await resolveId(source, importer, options);
        return result;
      }
      return { ...result, resolveId: myResolveId };
    })(),

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
        silenceDeprecations: ['import', 'global-builtin'],
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
