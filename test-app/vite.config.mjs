import { defineConfig } from 'vite';
import { extensions, ember, contentFor, compatPrebuild } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import yaml from '@modyfi/vite-plugin-yaml';
import { exports as resolveExports } from 'resolve.exports';

import fs from 'fs';
import path from 'node:path';

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return false;
  }
}
const packageMap = {
  '@lblod/ember-rdfa-editor': '../packages/ember-rdfa-editor',
  '@lblod/say-ar-design-plugin': '../packages/plugins/say-ar-design-plugin',
  '@lblod/say-roadsign-regulation-plugin':
    '../packages/plugins/say-roadsign-regulation-plugin',
};
const parsedPackageMap = Object.fromEntries(
  Object.entries(packageMap).map(([pkg, location]) => {
    return [pkg, JSON.parse(fs.readFileSync(`${location}/package.json`))];
  }),
);

// order matters
const sourceExtensions = ['.ts', '.gts'];
const monorepoPackages = Object.keys(packageMap);
const customResolverCache = new Map();
export default defineConfig({
  resolve: {
    conditions: ['module', 'browser', 'development|production'],
    dedupe: [
      '@lblod/ember-rdfa-editor',
      '@lblod/say-roadsign-regulation-plugin',
      '@lblod/say-ar-design-plugin',
    ],
    // this is a small hack we need to make the implicit component injection work in the lblod-plugins package,
    // which still has some loose-mode components.
    // once that's converted to gts and/or fully incorporated, this can go away
    alias: [
      {
        find: '@lblod/ember-rdfa-editor/_app_',
        replacement: '@lblod/ember-rdfa-editor',
      },
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
    // TODO: remove when we upgrade ember-intl to v8+, and when we've ported all the plugins over to v2 addons
    compatPrebuild(),
    // classicEmberSupport(),
    // extra plugins here
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    {
      name: 'custom-resolve',
      enforce: 'pre',
      buildStart() {
        // note: you might have to manually restart the dev server if you change the exports config of package.json
        // without changing the corresponding import
        customResolverCache.clear();
      },
      async resolveId(id, parent) {
        const cachedId = customResolverCache.get(id);
        if (cachedId) {
          return cachedId;
        }
        for (const pkg of monorepoPackages) {
          if (
            id === pkg ||
            (id.startsWith(pkg) &&
              (id.charAt(pkg.length) === undefined ||
                id.charAt(pkg.length) === '/'))
          ) {
            const resolvedPath = resolveExports(parsedPackageMap[pkg], id)[0];
            const packagePath = packageMap[pkg];
            if (resolvedPath) {
              const modifiedPath = resolvedPath.replace('dist', 'src');

              const searchDir = path.join(
                packagePath,
                path.dirname(modifiedPath),
              );
              // get the bare filename without extension
              const filenameToSearch = path.basename(
                modifiedPath,
                path.extname(modifiedPath),
              );
              for (const ext of sourceExtensions) {
                const finalFilename = `${filenameToSearch}${ext}`;
                const finalPath = path.join(searchDir, finalFilename);
                if (fileExists(finalPath)) {
                  // we return the absolute resolved path to avoid any more implicit
                  // resolution shenanigans
                  const fullPath = path.resolve(finalPath);
                  customResolverCache.set(id, fullPath);
                  return fullPath;
                }
              }

              console.log(`found a match for the id in the package.json exports, but could not find a real file in src.
Original import id: ${id}
imported from: ${parent}
match found: ${resolvedPath}
searched in: ${searchDir}
tried extensions: ${sourceExtensions.join(',')}
`);
              return null;
            } else {
              console.log(
                `Could not resolve import id ${id}, imported from ${parent} in it's project's package.json. Make sure you're importing without a file extension, and/or check the exports config of ${packageMap[pkg]}`,
              );
              return null;
            }
          }
        }
        return null;
      },
    },
  ],
});
