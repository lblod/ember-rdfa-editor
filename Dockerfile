FROM node:24-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
WORKDIR /app
COPY . .
RUN npm config set ignore-scripts true
RUN pnpm build
RUN pnpm build:test-app

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/test-app/dist /data
