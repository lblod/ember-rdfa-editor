#!/bin/bash

# The image used for the docker run command must be the same as in `.woodpecker/.cypress.yml` \
# to ensure that snapshots are captured in the same browser versions both locally and in CI.

# The `--add-host` flag is used to ensure that the Cypress tests can access the host machine,
# which is required for visual regression testing, with the application running locally.

docker run -it \
--add-host=host.docker.internal:host-gateway \
-v "$PWD":/cypress \
-w /cypress \
cypress/included:cypress-13.6.1-node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1 . \
--config baseUrl=http://host.docker.internal:4200 \
--env grepTags=@vrt
