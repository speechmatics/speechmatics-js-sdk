#!/usr/bin/env tsx

import { dirname } from 'node:path';
import {
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
  constraints: {
    modelName: typeScriptDefaultModelNameConstraints({
      NAMING_FORMATTER: (name) => {
        if (name === 'Error') {
          return 'ErrorType';
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
    // Anywhere we would output `any` we want to output `unknown` instead
    Any: () => {
      return 'unknown';
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
  const flowSpec = await readFile(`${packageDir}/schema/flow.yml`, 'utf-8');
  const parsed = parse(flowSpec);
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
