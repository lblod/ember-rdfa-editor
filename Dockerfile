FROM madnificent/ember:4.12.1-node_18 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json package-lock.json ./
COPY public ./public/
RUN npm ci
COPY . .
RUN ember build -prod

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
