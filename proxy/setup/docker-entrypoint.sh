#!/bin/sh

if [ -f /etc/ssl/certs/ssl.key ] && [ -f /etc/ssl/certs/ssl.crt ]; then
    echo "SSL key and certificate found. Using existing files."
else
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/certs/ssl.key \
        -out /etc/ssl/certs/ssl.crt \
        -subj "/CN=transendence"
fi

exec "$@"