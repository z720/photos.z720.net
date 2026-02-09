FROM node AS builder
WORKDIR /src
COPY . /src

FROM ghcr.io/z720/lighttpd:develop
COPY --from=builder /src/_site/ /var/www/html
