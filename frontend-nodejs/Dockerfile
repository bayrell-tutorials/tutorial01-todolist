FROM bayrell/nodejs


ADD src /srv/frontend-nodejs/

RUN echo "[1] Install backend"; \
    cd /srv/frontend-nodejs; \
    npm install --allow-root; \
    bower install --allow-root

CMD ["/srv/frontend-nodejs/run.sh"]
