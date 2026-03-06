#!/usr/bin/env bash

if git ls-files -m --error-unmatch quickstart/package.json 2>/dev/null 1>/dev/null; then
  echo "unsaved changes to quickstart/package.json that will be overwritten. Aborting"
  exit 1
fi

# Fail on error and echo commands for easier debugging
set -exo pipefail

# Adding the quickstart app to the workspace seems to cause typescript-eslint issues, even if the
# versions used in the editor package are unchanged. So avoid that by only adding it for the
# relevant test...
PACKAGE_FILE=$(pnpm say pack 2>/dev/null | tail -n 1 | sed 's_/_\\/_g')

cd quickstart
sed -i s/'workspace:\*'/"$PACKAGE_FILE"/ package.json
rm -f package-lock.json
# Run installs specified in the readme
npm install --save-dev @appuniversum/ember-appuniversum @ember/test-helpers @glimmer/component @glimmer/tracking @glint/template ember-basic-dropdown ember-concurrency 'ember-intl@^7.0.0' ember-power-select ember-power-select-with-create ember-source tracked-built-ins
npm install --save-dev sass
cd ..
