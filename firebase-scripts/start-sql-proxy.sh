#!/bin/bash

SCRIPTDIR=`dirname $0`
BASEDIR=`cd ${SCRIPTDIR}/..; pwd`

echo "Running SQL proxy"

cloud_sql_proxy \
  -instances=gssb-library-c7c5e:us-central1:spils=tcp:3307 \
  -credential_file=${BASEDIR}/server/config/gssb-library-c7c5e-cloud-sql-dd579be31370.json
