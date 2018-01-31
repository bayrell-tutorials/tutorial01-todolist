#!/usr/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`


while [ 1 ]; do
    CMD="${SCRIPT_PATH}/backend.php"
    echo "Run $CMD"
    eval $CMD
    sleep 5
done
