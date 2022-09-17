#!/bin/bash -eu

SCRIPTDIR=`dirname $0`
BASEDIR=`cd ${SCRIPTDIR}/..; pwd`

echo "Compiling Angular Client"

cd ${BASEDIR}/client
npm install
node_modules/.bin/ng build --configuration production --base-href "/"
node_modules/.bin/ng build --configuration production --base-href "/" public

echo "Compiling Node Server"

cd ${BASEDIR}/server
npm run build

echo "Deploying"

cd ${BASEDIR}
firebase deploy
