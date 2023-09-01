#!/usr/bin/env node

const esbuild = require('esbuild');
const { globSync } = require('glob');
const packageInfo = require('./package.json');

const testFiles = globSync('./src/**/*.test.ts');

esbuild
  .build({
    define: {
      SDK_VERSION: `'${packageInfo.version}'`,
    },
    format: 'cjs',
    platform: 'neutral',
    mainFields: ['main'],
    entryPoints: globSync(['./src/**/*ts'], {
      ignore: testFiles,
    }),
    outdir: './dist',
    sourcemap: 'linked',
  })
  .catch(() => process.exit(1));
