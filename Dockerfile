FROM node AS builder
WORKDIR /src
COPY . /src
# ARG DATA=False
RUN npm ci

# RUN --mount=type=secret,id=.secrets \
#  # --mount=type=secret,id=FLICKR_API_KEY,env=FLICKR_API_KEY \
#  # --mount=type=secret,id=FLICKR_USER,env=FLICKR_USER \
#  # --mount=type=secret,id=FLICKR_COLLECTION,env=FLICKR_COLLECTION \
#     if [ "$DATA" = "True" ]; then \
#         . /run/secrets/.secrets && export $(grep -Ev '(^\s*#|^\s*$)' .env | cut -d '=' -f 1); \
#         npm run generate:data; \
#     fi
COPY ./_data ./_data

RUN npm run generate:site

FROM ghcr.io/z720/lighttpd:develop
COPY --from=builder /src/_site/ /var/www/html
