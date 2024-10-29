#!/bin/bash -e

PROJECT_ROOT=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )/..

openapi-generator generate -i ${PROJECT_ROOT}/schema/batch.yml -g typescript-axios --global-property models -o ${PROJECT_ROOT}/ -c ${PROJECT_ROOT}/schema/autogen.json
