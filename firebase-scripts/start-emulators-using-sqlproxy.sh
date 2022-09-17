#!/bin/bash

SCRIPTDIR=`dirname $0`
BASEDIR=`cd ${SCRIPTDIR}/..; pwd`

export NODE_CONFIG_DIR=${BASEDIR}/server/config
export NODE_ENV=sqlproxy
export GOOGLE_APPLICATION_CREDENTIALS=${BASEDIR}/server/config/gssb-library-c7c5e-firebase-adminsdk-1gafi-a5c1873ec3.json

cd ${BASEDIR}/server
npm run build

echo "Running emulators with ${NODE_CONFIG_DIR}/${NODE_ENV}.json"

firebase emulators:start
