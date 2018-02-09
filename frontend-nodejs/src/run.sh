#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`


# Run consul loop service register
${SCRIPT_PATH}/consul.sh &


cd /srv/frontend-nodejs/

# Run nodejs frontend
while [ 1 ]; do
    CMD="node index.js"
    echo "Run $CMD"
    eval $CMD
    sleep 5
done

