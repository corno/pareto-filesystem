#!/usr/bin/env bash

scriptDir=`realpath $(dirname "$0")`

$scriptDir/buildPackage.sh $(pwd)/pub && \

#only execute these 2 if the build was successful
{
    find ./pub/dist/esc/bin/* ./pub/dist/bin/* -name "*.js" -exec chmod 777 {} + 2> /dev/null
    $scriptDir/buildPackage.sh $(pwd)/test
}