# Regenerating models from spec

## Real Time models

The real time models are generated using the `openapi-generator` tool despite the realtime api spec not being an Open API specification.

To achieve this, we generate a temporary 'fake' openapi spec with the json schemas from the realtime api spec.

Running the following script will regenerate any existing models based on the async api and put them in `/src/types/realtime`

```bash
cd scripts/generate-models
./generate-models-rt.sh
```

Once the models have been recreated, they can be commited into the repo
