#!/bin/bash
SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}); pwd)
rm -rf $SCRIPT_DIR/ledger
rm -f $SCRIPT_DIR/gvite.log
BIN_FILE=gvite
CFG_FILE=node_config.json
if [ $# == 1 ]; then
BIN_FILE=$1
fi
if [ $# == 2 ]; then
BIN_FILE=$1
CFG_FILE=$2
fi
cd $SCRIPT_DIR
exec ./$BIN_FILE --config $CFG_FILE --pprof > ./gvite.log