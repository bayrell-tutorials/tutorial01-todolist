FROM bayrell/centos7_php71

ADD src /srv/backend-php/

RUN yum update -y; \
    yum install php71-php-bcmath php71-php-pecl-mongodb php71-php-mbstring git zip unzip mc nano htop -y; \
    cd /srv/backend-php; \
    composer install; \
    yum clean all; \
    rm -rv /var/cache/yum

#ENTRYPOINT ["/srv/backend-php/run.sh"]
