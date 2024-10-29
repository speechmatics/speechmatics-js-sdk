#!/bin/bash -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT=${SCRIPT_DIR}/..

# Get a 'fake' openapi spec from the async realtime-api spec (we just need the schemas)
pnpm tsx ${SCRIPT_DIR}/transform-async-to-openapi.ts

openapi-generator generate -i ${SCRIPT_DIR}/openapi-transformed.yaml -g typescript-axios --global-property models  -o ${PROJECT_ROOT}/ -c ${SCRIPT_DIR}/../schema/autogen.json
