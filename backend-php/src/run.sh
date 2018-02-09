#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`


# Run consul loop service register
${SCRIPT_PATH}/consul.sh &


# Run php backend
while [ 1 ]; do
    CMD="${SCRIPT_PATH}/backend.php"
    echo "Run $CMD"
    eval $CMD
    sleep 5
done
