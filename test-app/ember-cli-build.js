'use strict';

const path = require('path');
const fs = require('fs');

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
module.exports = async function (defaults) {
  const { readPackageUpSync } = await import('read-package-up');

  let app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
      sourceMaps: 'inline',
    },
    autoImport: {
      watchDependencies: [],
    },
    trees: {
      app: (() => {
        let sideWatch = require('@embroider/broccoli-side-watch');

        let paths = ['@lblod/ember-rdfa-editor'].map((libraryName) => {
          let entry = require.resolve(libraryName);
          let { packageJson, path: packageJsonPath } = readPackageUpSync({
            cwd: entry,
          });
          let packagePath = path.dirname(packageJsonPath);

          console.debug(
            `Side-watching ${libraryName} from ${packagePath}, which started in ${entry}`,
          );

          let toWatch = packageJson.files
            .map((f) => path.join(packagePath, f))
            .filter((p) => {
              if (!fs.existsSync(p)) return false;
              if (!fs.lstatSync(p).isDirectory()) return false;

              return !p.endsWith('/src');
            });

          return toWatch;
        });

        return sideWatch('app', { watching: paths.flat() });
      })(),
    },

    sassOptions: {
      sourceMap: true,
      sourceMapEmbed: true,
      includePaths: ['node_modules/@appuniversum/ember-appuniversum'],

      silenceDeprecations: ['import', 'global-builtin'],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
      },
    },
  });
};
