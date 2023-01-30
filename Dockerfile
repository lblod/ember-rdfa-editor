FROM madnificent/ember:4.9.2 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json package-lock.json ./
COPY public ./public/
RUN npm ci
COPY . .
EXPOSE 80
CMD ["ember", "s", "--port", "80"]
