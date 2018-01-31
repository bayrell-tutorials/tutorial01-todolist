FROM bayrell/centos7_repos:latest

COPY ../../php-backend /srv/backend-php
RUN yum install php71-php-bcmath php71-php-pecl-mongodb

ENTRYPOINT ["/srv/backend-php/run.sh"]
