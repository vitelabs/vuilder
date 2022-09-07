#!/bin/bash
pgrep gvite | xargs kill -9
pgrep gvite | xargs wait
# keep the debug logs in ./ledger/devdata util the next start