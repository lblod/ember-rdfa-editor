FROM node:20-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
RUN corepack prepare pnpm@9.4 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY public ./public/
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
