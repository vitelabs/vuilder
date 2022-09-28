#!/bin/bash

SCRIPT_DIR=$(
	cd $(dirname ${BASH_SOURCE[0]})
	pwd
)
BIN_FILE=gvite
CFG_FILE=node_config.json
LOG_FILE=gvite.log
if [ $# == 3 ]; then
	BIN_FILE=$1
	CFG_FILE=$2
	LOG_FILE=$3
fi
cd $SCRIPT_DIR
exec ./$BIN_FILE virtual --config $CFG_FILE >./$LOG_FILE
