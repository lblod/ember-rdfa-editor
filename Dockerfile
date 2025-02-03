FROM node:20-slim AS builder

LABEL maintainer="info@redpencil.io"

RUN corepack enable
# installing the latest corepack manually because of https://github.com/nodejs/corepack/issues/612
RUN npm i -g corepack@0.31
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches/
COPY public ./public/
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
