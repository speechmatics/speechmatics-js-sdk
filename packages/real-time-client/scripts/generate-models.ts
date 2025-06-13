#!/usr/bin/env tsx

import { dirname } from 'node:path';
import {
  TS_DESCRIPTION_PRESET,
  typeScriptDefaultModelNameConstraints,
  TypeScriptGenerator,
} from '@asyncapi/modelina';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { rm } from 'node:fs/promises';
import { parse } from 'yaml';
import { exec } from 'node:child_process';

const packageDir = `${dirname(require.main?.filename ?? '')}/..`;
const rootDir = `${packageDir}/../..`;

function checkNodeVersion() {
  const version = process.version;
  const major = Number.parseInt(version.split('.')[0]);
  if (major < 22) {
    throw new Error('Node.js version 22 or higher is required');
  }
}

const generator = new TypeScriptGenerator({
  presets: [TS_DESCRIPTION_PRESET],
  constraints: {
    modelName: typeScriptDefaultModelNameConstraints({
      NAMING_FORMATTER: (name) => {
        if (name === 'Error') {
          return 'ErrorType';
        }
        if (name === 'publish') {
          return 'RealtimeClientMessage';
        }
        if (name === 'subscribe') {
          return 'RealtimeServerMessage';
        }
        return name;
      },
    }),
  },

  modelType: 'interface',
  enumType: 'union',
  mapType: 'indexedObject',
  rawPropertyNames: true,
  moduleSystem: 'ESM',
  typeMapping: {
    Any() {
      // Use 'unknown' instead of 'any' by default
      return 'unknown';
    },
    Union(context) {
      if (context.constrainedModel.name === 'RealtimeClientMessage') {
        // Exclude AddAudio from the union type, since we handle it separately from the JSON messages
        context.constrainedModel.union = context.constrainedModel.union.filter(
          (m) => m.name !== 'AddAudio',
        );
      }
      return TypeScriptGenerator.defaultOptions.typeMapping.Union(context);
    },
  },
  processorOptions: {
    interpreter: {
      ignoreAdditionalProperties: true,
    },
  },
});

async function clearModels(): Promise<void> {
  await rm(`${packageDir}/models`, {
    recursive: true,
    force: true,
  });
}

export async function generate(): Promise<void> {
  const realtimeSpec = await readFile(
    `${packageDir}/schema/realtime.yml`,
    'utf-8',
  );
  const parsed = parse(realtimeSpec);
  const models = await generator.generateCompleteModels(parsed, {
    exportType: 'named',
  });

  // Ensure the models directory exists
  await mkdir(`${packageDir}/models`);

  for (const model of models) {
    await writeFile(`${packageDir}/models/${model.modelName}.ts`, model.result);
  }

  await writeFile(
    `${packageDir}/models/index.ts`,
    models.map((m) => `export * from './${m.modelName}';`).join('\n'),
  );
}

if (require.main === module) {
  checkNodeVersion();
  clearModels()
    .then(() => generate())
    .then(() =>
      exec('pnpm lint && pnpm format', {
        cwd: rootDir,
      }),
    );
}
