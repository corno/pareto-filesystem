#!/usr/bin/env bash

dir=`realpath $(dirname "$0")`

$dir/updatePackage.sh ./pub
$dir/updatePackage.sh ./test

if [ -d "../dev" ]
then
    $dir/updatePackage.sh "./dev"
fi
