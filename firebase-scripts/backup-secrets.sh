#!/bin/bash -eu

SCRIPTDIR=`dirname $0`
BASEDIR=`cd ${SCRIPTDIR}/..; pwd`

SECRETS_BACKUP_FILE=/tmp/gssb-firebase-secrets.tar.gz

cd ${BASEDIR}
tar cfz ${SECRETS_BACKUP_FILE} \
    provision/grains \
    server/config \
    server/.env \
    client/src/environments
ls -al ${SECRETS_BACKUP_FILE}
tar tfz  ${SECRETS_BACKUP_FILE}
