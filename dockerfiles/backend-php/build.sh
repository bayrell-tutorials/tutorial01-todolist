#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`
BASE_PATH=`dirname $SCRIPT_PATH`


RETVAL=0

case "$1" in
  composer)
    pushd $BASE_PATH

    echo "Install composer files"
    cd php-backend
    composer install

    popd
    ;;

  docker)
    docker build ./ -t bayrell/tutorial01-backend-php
    ;;

  *)
    echo "Usage: $0 {composer|docker}"
    RETVAL=1
esac

exit $RETVAL