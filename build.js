#!/usr/bin/env node

const esbuild = require('esbuild');
const { globSync } = require('glob');
const packageInfo = require('./package.json');

const testFiles = globSync('./src/**/*.test.ts');

const config = {
  define: {
    SDK_VERSION: `'${packageInfo.version}'`,
  },
  platform: 'neutral',
  mainFields: ['main'],
  entryPoints: globSync(['./src/**/*ts'], {
    ignore: testFiles,
  }),
  sourcemap: 'linked',
};

// Build CJS
esbuild
  .build({
    ...config,
    format: 'cjs',
    outdir: './dist',
    outExtension: { '.js': '.cjs' },
  })
  .catch(() => process.exit(1));

// Build ESM
esbuild
  .build({
    ...config,
    format: 'esm',
    outdir: './dist',
    outExtension: { '.js': '.mjs' },
  })
  .catch(() => process.exit(1));
