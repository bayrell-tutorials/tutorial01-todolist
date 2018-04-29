#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`


cd /srv/frontend-nodejs/

# Run nodejs frontend
while [ 1 ]; do
    CMD="node index.js"
    echo "Run $CMD"
    eval $CMD
    sleep 10
done

