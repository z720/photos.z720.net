FROM node AS builder
WORKDIR /src
COPY . /src
#ARG FLICKR_API_KEY
ARG FLICKR_COLLECTION
ARG FLICKR_USER
RUN npm ci
RUN --mount=type=secret,id=FLICKR \
    source /run/secrets/FLICKR; \ 
    npm run generate:data
RUN npm run generate:site

FROM ghcr.io/z720/lighttpd:develop
COPY --from=builder /src/_site/ /var/www/html
