FROM debian:stable-20250224-slim

WORKDIR /app

RUN apt update
RUN apt install -y nginx-full
RUN apt install -y openssl

RUN mkdir -p /etc/nginx/transendence-config

COPY setup/docker-entrypoint.sh /app/setup/docker-entrypoint.sh
RUN chmod +x /app/setup/docker-entrypoint.sh && chmod 777 /app/setup/docker-entrypoint.sh
RUN mkdir -p /var/www/html && chmod 777 /var/www/html

EXPOSE 443

STOPSIGNAL SIGQUIT

ENTRYPOINT [ "./setup/docker-entrypoint.sh" ]

CMD [ "nginx", "-c", "/etc/nginx/transendence-config/nginx.conf", "-g", "daemon off;" ]