FROM madnificent/ember:3.5.0 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 80
CMD ["ember", "s", "--port", "80"]
