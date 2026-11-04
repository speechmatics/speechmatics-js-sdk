#!/usr/bin/env tsx

import { dirname } from 'node:path';
import {
  ConstrainedUnionModel,
  type OutputModel,
  typeScriptDefaultModelNameConstraints,
  TypeScriptGenerator,
} from '@asyncapi/modelina';
import { writeFile, mkdir } from 'node:fs/promises';
import { rm } from 'node:fs/promises';
import { parse } from 'yaml';
import { exec } from 'node:child_process';
import { TS_DESCRIPTION_PRESET } from './description';

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
        return name;
      },
      NO_RESERVED_KEYWORDS: (value) => {
        if (value === 'File') {
          return 'FileType';
        }
        return value;
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
    String(context) {
      if (context.constrainedModel.name === 'AddAudio') {
        // Type AddAudio as whatever the consumer's WebSocket accepts, rather than a plain string
        return "Parameters<WebSocket['send']>[0]";
      }
      return TypeScriptGenerator.defaultOptions.typeMapping.String(context);
    },
    Object(context) {
      // When rendering Object types, if the 'title' prop is set to "Object", use the x-parser-schema-id instead
      if (context.constrainedModel.name === 'Object') {
        context.constrainedModel.name =
          context.constrainedModel.originalInput['x-parser-schema-id'];
      }
      return TypeScriptGenerator.defaultOptions.typeMapping.Object(context);
    },
    Reference(context) {
      // When rendering references to Object types, if the 'title' prop is set to "Object", use the x-parser-schema-id instead
      if (context.constrainedModel.name === 'Object') {
        context.constrainedModel.name =
          context.constrainedModel.originalInput['x-parser-schema-id'];
      }
      return TypeScriptGenerator.defaultOptions.typeMapping.Reference(context);
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

// biome-ignore lint/suspicious/noExplicitAny: raw, untyped YAML document
type SpecObject = Record<string, any>;

/** Resolve a local JSON pointer `$ref` (e.g. `#/components/messages/Foo`) */
function resolveRef(spec: SpecObject, ref: string): SpecObject {
  if (!ref.startsWith('#/')) {
    throw new Error(`Only local $refs are supported, got ${ref}`);
  }
  return ref
    .slice(2)
    .split('/')
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((node, key) => {
      if (node?.[key] === undefined)
        throw new Error(`Unresolvable $ref ${ref}`);
      return node[key];
    }, spec);
}

/** Follow a chain of `$ref`s (e.g. operation -> channel message -> component message) */
function deref(spec: SpecObject, node: SpecObject): SpecObject {
  let current = node;
  while (current.$ref) current = resolveRef(spec, current.$ref);
  return current;
}

/**
 * The name of each union type we export, keyed by operation action. The spec is
 * written from the server's point of view: it *receives* client messages and
 * *sends* server messages.
 */
const UNION_NAME_FOR_ACTION: Record<string, string> = {
  receive: 'RealtimeClientMessage',
  send: 'RealtimeServerMessage',
};

/**
 * For each operation, the component schema names of the JSON message payloads it
 * carries. Binary messages (e.g. `AddAudio`) are excluded, since the client sends
 * them separately from the JSON messages.
 *
 * Must run after {@link hoistInlinePayloads}, so every payload is a component
 * schema `$ref`.
 */
function getOperationUnions(spec: SpecObject): Map<string, string[]> {
  const unions = new Map<string, string[]>();
  const defaultContentType = spec.defaultContentType ?? 'application/json';

  for (const [operationId, operation] of Object.entries<SpecObject>(
    spec.operations ?? {},
  )) {
    const unionName = UNION_NAME_FOR_ACTION[operation.action];
    if (!unionName) {
      throw new Error(
        `Unexpected action '${operation.action}' for operation ${operationId}`,
      );
    }
    if (unions.has(unionName)) {
      throw new Error(`More than one '${operation.action}' operation in spec`);
    }

    // Per AsyncAPI 3, an operation with no `messages` carries all its channel's messages
    const messageRefs: SpecObject[] =
      operation.messages ??
      Object.values(deref(spec, operation.channel).messages ?? {});

    const schemaNames = messageRefs
      .map((ref) => deref(spec, ref))
      .filter(
        (message) =>
          (message.contentType ?? defaultContentType) === 'application/json',
      )
      .map((message) => {
        const payloadRef: string | undefined = message.payload?.$ref;
        if (!payloadRef?.startsWith('#/components/schemas/')) {
          throw new Error(
            `Expected payload of ${message.name ?? 'message'} in ${operationId} to be a component schema $ref`,
          );
        }
        return payloadRef.replace('#/components/schemas/', '');
      });

    unions.set(unionName, schemaNames);
  }
  return unions;
}

function renderUnion(name: string, members: string[]): string {
  return [
    ...members.map((m) => `import type { ${m} } from './${m}';`),
    `type ${name} = ${members.map((m) => `| ${m}`).join('\n')};`,
    `export type { ${name} };`,
  ].join('\n');
}

/**
 * Inline message payloads (e.g. the binary `AddAudio` payload) would otherwise
 * be generated as `anonymous_schema_N`. Hoist them into component schemas named
 * after their message.
 */
function hoistInlinePayloads(spec: SpecObject) {
  spec.components.schemas ??= {};
  for (const [name, message] of Object.entries<SpecObject>(
    spec.components.messages ?? {},
  )) {
    if (!message.payload || message.payload.$ref) continue;
    if (spec.components.schemas[name]) {
      throw new Error(`Cannot hoist payload of ${name}: schema already exists`);
    }
    spec.components.schemas[name] = message.payload;
    message.payload = { $ref: `#/components/schemas/${name}` };
  }
}

/**
 * Enums with per-value docs are written as a `oneOf` of `const` schemas, which
 * Modelina inlines into the referencing property rather than emitting a named
 * type (e.g. `ErrorTypeEnum`). Convert them to a plain `enum`, keeping the
 * per-value descriptions as a markdown table in the type's doc comment.
 */
function convertConstOneOfToEnum(spec: SpecObject) {
  const schemas: SpecObject = spec.components.schemas ?? {};
  for (const [name, schema] of Object.entries<SpecObject>(schemas)) {
    const { oneOf: variants, ...rest } = schema;
    if (
      !Array.isArray(variants) ||
      !variants.length ||
      !variants.every((v) => 'const' in v)
    ) {
      continue;
    }

    const rows = variants
      .filter((v) => v.description)
      .map(
        (v) =>
          `| \`${v.const}\` | ${v.description.trim().replace(/\s*\n\s*/g, ' ')} |`,
      );
    const table = rows.length
      ? ['| Value | Description |', '| --- | --- |', ...rows].join('\n')
      : undefined;

    schemas[name] = {
      ...rest,
      enum: variants.map((v) => v.const),
      description:
        [rest.description?.trim(), table].filter(Boolean).join('\n\n') ||
        undefined,
    };
  }
}

/**
 * Adapt the AsyncAPI 3 spec so Modelina produces the same payload models (and
 * model names) as earlier versions of the spec.
 */
function normalizeSpec(spec: SpecObject): SpecObject {
  if (!String(spec.asyncapi).startsWith('3.')) {
    throw new Error(`Expected an AsyncAPI 3.x spec, got ${spec.asyncapi}`);
  }
  hoistInlinePayloads(spec);
  convertConstOneOfToEnum(spec);
  return spec;
}

/**
 * Modelina generates one union per operation with multiple messages, but names
 * it after the operation's *channel*. Since both operations here share a single
 * channel, one union silently overwrites the other. So we drop Modelina's
 * channel unions (see {@link isChannelUnion}), and render our own per-operation
 * unions instead.
 *
 * TODO: Remove this workaround (along with `isChannelUnion`,
 * `getOperationUnions` and `renderUnion`) if this issue is resolved in Modelina:
 * https://github.com/asyncapi/modelina/issues/2703
 */
function buildOperationUnions(
  spec: SpecObject,
  models: OutputModel[],
): { name: string; result: string }[] {
  const modelNameForSchema = new Map<string, string>();
  for (const m of models) {
    const schemaId = m.model.originalInput?.['x-parser-schema-id'];
    if (typeof schemaId === 'string')
      modelNameForSchema.set(schemaId, m.modelName);
  }

  return [...getOperationUnions(spec)].map(([unionName, schemaNames]) => {
    const members = schemaNames.map((schemaName) => {
      const modelName = modelNameForSchema.get(schemaName);
      if (!modelName) {
        throw new Error(
          `No generated model for schema ${schemaName} in ${unionName}`,
        );
      }
      return modelName;
    });
    return { name: unionName, result: renderUnion(unionName, members) };
  });
}

/**
 * Whether a model is one of Modelina's channel-named unions, which we replace
 * with per-operation unions. See https://github.com/asyncapi/modelina/issues/2703
 */
function isChannelUnion(spec: SpecObject, model: OutputModel): boolean {
  const id = model.model.originalInput?.$id;
  return (
    model.model instanceof ConstrainedUnionModel &&
    typeof id === 'string' &&
    id in (spec.channels ?? {})
  );
}

export async function generate(): Promise<void> {
  const branch = process.env.GITHUB_HEAD_REF ?? 'main';
  const realtimeSpec = await fetch(
    `https://raw.githubusercontent.com/speechmatics/docs/refs/heads/${branch}/spec/realtime.yaml`,
  );
  const realtimeSpecText = await realtimeSpec.text();
  const parsed = normalizeSpec(parse(realtimeSpecText));

  const generated = await generator.generateCompleteModels(parsed, {
    exportType: 'named',
  });
  const models = generated.filter((m) => !isChannelUnion(parsed, m));
  const unions = buildOperationUnions(parsed, models);

  const files = [
    ...unions,
    ...models.map((m) => ({ name: m.modelName, result: m.result })),
  ];

  // Ensure the models directory exists
  await mkdir(`${packageDir}/models`);

  for (const { name, result } of files) {
    await writeFile(`${packageDir}/models/${name}.ts`, result);
  }

  await writeFile(
    `${packageDir}/models/index.ts`,
    files.map(({ name }) => `export * from './${name}';`).join('\n'),
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
