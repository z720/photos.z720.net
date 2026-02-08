FROM ghcr.io/z720/lighttpd:develop
COPY ./_site/ /var/www/html
