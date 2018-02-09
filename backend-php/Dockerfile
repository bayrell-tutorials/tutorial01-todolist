FROM php71


ADD src /srv/backend-php/

RUN echo "[1] Install backend"; \
    cd /srv/backend-php; \
    composer install

CMD ["/srv/backend-php/run.sh"]
