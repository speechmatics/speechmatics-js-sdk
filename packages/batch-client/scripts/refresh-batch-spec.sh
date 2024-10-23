#!/bin/bash

PROJECT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/..

OUT_FILE=$PROJECT_ROOT/batch.yml

if ! (wget -qO- https://docs.speechmatics.com/api/jobs-spec-final.yaml > $OUT_FILE); then
    echo "Error fetching batch spec"
    exit 1
fi