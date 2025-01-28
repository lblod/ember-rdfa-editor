FROM node:22-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm i --frozen-lockfile
RUN pnpm build:test-app

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/test-app/dist /data
