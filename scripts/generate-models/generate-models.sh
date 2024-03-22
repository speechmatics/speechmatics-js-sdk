#!/bin/bash -e

# Ensures we find the files regardless of where invoked
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

OUTPUT_MODELS_DIRECTORY="${SCRIPT_DIR}/../../src/types/models"

pip3 install -r "${SCRIPT_DIR}/requirements.txt"

# Get a 'fake' openapi spec from the async realtime-api spec (we just need the schemas)
python3 ${SCRIPT_DIR}/transform_async_to_openapi.py

# # Generate models from the generated openapi spec using the openapi-generator tool
openapi-generator generate -i ${SCRIPT_DIR}/openapi-transformed.yaml -g typescript-axios -o ${SCRIPT_DIR}/openapi_models_tmp -c ${SCRIPT_DIR}/../../autogen.json
mkdir -p ${OUTPUT_MODELS_DIRECTORY}
rm -r ${OUTPUT_MODELS_DIRECTORY}/*
mv ${SCRIPT_DIR}/openapi_models_tmp/models/* ${OUTPUT_MODELS_DIRECTORY}

# # Delete temp files
rm ${SCRIPT_DIR}/openapi-transformed.yaml
rm -rf ${SCRIPT_DIR}/openapi_models_tmp
