#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`
BASE_PATH=`dirname $SCRIPT_PATH`

pushd $BASE_PATH

echo "Install php71-php-bcmath"
yum install php71-php-bcmath

echo ""
echo "[php-backend] composer install"
cd php-backend
composer install


cd ..


echo ""
echo "[vuejs] bower install"
cd vuejs
bower install

popd

