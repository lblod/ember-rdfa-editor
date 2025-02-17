#!/usr/bin/env sh

# This script exists because glint does not currently respect the --project flag, so we need to
# switch out the tsconfig.json file to generate declarations, without that configuration preventing
# --watch from running correctly

mv tsconfig.json tsconfig.watch.json
mv tsconfig.declarations.json tsconfig.json

glint --declaration
RETURN_VAL=$?

mv tsconfig.json tsconfig.declarations.json
mv tsconfig.watch.json tsconfig.json

exit $RETURN_VAL
