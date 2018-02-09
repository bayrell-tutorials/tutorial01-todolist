FROM node:9.5-alpine


ADD src /srv/frontend-nodejs/

RUN echo "[1] Install system components"; \
    apk update; \
    apk add bash; \
    apk add git; \
    apk add curl; \
    npm install bower -g --allow-root; \
    echo "[2] Install backend"; \
    cd /srv/frontend-nodejs; \
    npm install --allow-root; \
    bower install --allow-root

CMD ["/srv/frontend-nodejs/run.sh"]
