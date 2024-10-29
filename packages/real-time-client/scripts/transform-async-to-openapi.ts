#!/usr/bin/env tsx

import YAML from 'yaml';
import * as fs from 'node:fs';
import * as path from 'node:path';

const dirPath = path.dirname(__filename);

try {
  // Open the async spec
  const asyncSpecPath = path.join(dirPath, '../schema/realtime.yml');
  const asyncSpecContent = fs.readFileSync(asyncSpecPath, 'utf8');
  const asyncSpec = YAML.parse(asyncSpecContent);

  // Open a basic OpenAPI template as a starting document
  const templatePath = path.join(dirPath, '../schema/template-openapi.yml');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const template = YAML.parse(templateContent);

  // Extract the messages models from async spec
  const messagesModelsYaml = asyncSpec.components.messages;

  // Generate an enum of all message types
  const messageEnum: string[] = [];

  // Initialize the schemas component if not already initialized
  if (!template.components) {
    template.components = { schemas: {} };
  } else if (!template.components.schemas) {
    template.components.schemas = {};
  }

  // Add the payload field of 'components.messages' as schemas to the generated OpenAPI spec
  for (const [modelName, modelContent] of Object.entries(messagesModelsYaml)) {
    messageEnum.push(modelName);
    if (
      modelContent &&
      typeof modelContent === 'object' &&
      'payload' in modelContent
    ) {
      const payload = modelContent.payload;
      template.components.schemas[modelName] = payload;
    } else {
      throw new Error(`Unexpected content: ${JSON.stringify(modelContent)}`);
    }
  }

  // Append enum to the schemas
  template.components.schemas.RealtimeMessage = {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        enum: messageEnum,
      },
    },
  };

  // Add the schemas from async spec to the OpenAPI generated spec
  Object.assign(template.components.schemas, asyncSpec.components.schemas);

  // Save the generated OpenAPI spec
  const outputFilePath = path.join(dirPath, 'openapi-transformed.yaml');
  fs.writeFileSync(outputFilePath, YAML.stringify(template), 'utf8');
} catch (err) {
  console.error(err);
}
