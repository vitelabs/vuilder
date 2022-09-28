#!/bin/bash
pgrep gvite | xargs kill -9 > /dev/null 2>&1
pgrep gvite | xargs wait > /dev/null 2>&1
SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}); pwd)
rm -rf $SCRIPT_DIR/ledger
rm -f $SCRIPT_DIR/gvite-*.log