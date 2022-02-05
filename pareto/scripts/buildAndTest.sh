#!/usr/bin/env bash


if [ -d "../dev" ]
then
    "$(dirname "$0")"/buildDevPackage.sh && \
    rm -rf ../pub/src/generated && \
    node ../dev/dist/esc/bin/generateCode.js ../pub/src/generated
fi \


"$(dirname "$0")"/buildPubAndTestPackages.sh && \
node ../test/dist/esc/bin/index.js ../test/data
