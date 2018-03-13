#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`
BASE_PATH=`dirname $SCRIPT_PATH`

RETVAL=0

case "$1" in

  docker)
    rm -rf $BASE_PATH/frontend-nodejs/src/node_modules
    rm -rf $BASE_PATH/frontend-nodejs/src/web/assets
    docker build ./ -t bayrell/tutorial01_frontend_nodejs
    ;;

  *)
    echo "Usage: $0 {docker}"
    RETVAL=1

esac

exit $RETVAL