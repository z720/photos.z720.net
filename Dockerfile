FROM node as builder
WORKDIR /src
COPY . /src
ARG FLICKR_API_KEY
ARG FLICKR_COLLECTION
ARG FLICKR_USER
RUN npm ci \
  && npm run generate:data \
  && npm run generate:site

FROM ghcr.io/z720/lighttpd:develop
COPY --from=builder /src/_site/ /var/www/html
