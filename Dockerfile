FROM node:22-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
# installing the latest corepack manually because of https://github.com/nodejs/corepack/issues/612
RUN npm i -g corepack@0.31
WORKDIR /app
COPY . .
RUN npm config set ignore-scripts true
RUN corepack enable
RUN corepack use pnpm@10.0.0
RUN pnpm build
RUN pnpm build:test-app

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/test-app/dist /data
