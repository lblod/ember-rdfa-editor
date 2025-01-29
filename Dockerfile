FROM node:22-slim AS builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY . .
RUN npm config set ignore-scripts true
RUN corepack enable
RUN corepack use pnpm@10.0.0
RUN pnpm build
RUN pnpm build:test-app

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/test-app/dist /data
