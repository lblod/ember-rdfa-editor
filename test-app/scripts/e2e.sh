#!/usr/bin/env bash

# The image used for the docker run command must be the same as in `.woodpecker/.e2e.yml` \
# to ensure that snapshots are captured in the same browser versions both locally and in CI.

# https://www.oddbird.net/2022/11/30/headed-playwright-in-docker/

OS=$(uname)
if [ "$OS" = "Darwin" ]; then
    DISPLAY_ENV="host.docker.internal:0"
else
    DISPLAY_ENV=":0"
fi

docker run -it --rm \
-v "$PWD":/e2e \
-e DISPLAY=$DISPLAY_ENV \
-w /e2e \
--platform linux/amd64 \
mcr.microsoft.com/playwright:v1.55.1-jammy \
npm exec corepack enable && pnpx playwright "$@"
