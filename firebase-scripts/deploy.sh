#!/bin/bash -eu

DIR=`dirname $0`
BASEDIR=`cd ${DIR}/..; pwd`

echo "Compiling Angular Client"

cd ${BASEDIR}/client2
npm install
node_modules/.bin/ng build --configuration production --base-href "/"
node_modules/.bin/ng build --configuration production --base-href "/" public

echo "Compiling Node Server"

cd ${BASEDIR}/functions
npm install
npm run build

echo "Deploying"

cd ${BASEDIR}
firebase deploy
