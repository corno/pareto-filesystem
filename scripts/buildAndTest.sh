#!/usr/bin/env bash
"$(dirname "$0")"/buildPubAndTestPackages.sh && \
node test/dist/esc/bin/index.js test/data
