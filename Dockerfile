FROM node:24-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
RUN npm i -g corepack@0.35
WORKDIR /app
COPY . .
RUN npm config set ignore-scripts true
RUN corepack enable
RUN corepack use pnpm@11.4.0
RUN pnpm build
RUN pnpm build:test-app

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/test-app/dist /data
