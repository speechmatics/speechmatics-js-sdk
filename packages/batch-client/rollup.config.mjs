import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' assert { type: 'json' };
const name = packageJSON.main.replace(/\.js$/, '');

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  const esModule = {
    plugins: [
      esbuild({
        define: {
          SDK_VERSION: `'${packageJSON.version}'`,
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: `${name}.mjs`,
      format: 'es',
      sourcemap: true,
    },
  };

  const cjs = {
    plugins: [
      esbuild({
        define: {
          SDK_VERSION: `'${packageJSON.version}'`,
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: `${name}.js`,
      format: 'cjs',
      sourcemap: true,
    },
  };

  const typeDefinitions = {
    plugins: [
      dts({
        compilerOptions: {
          removeComments: true,
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: `${name}.d.ts`,
    },
  };

  const minified = {
    plugins: [
      esbuild({
        define: {
          SDK_VERSION: `'${packageJSON.version}'`,
        },
        minify: true,
        optimizeDeps: {
          include: ['zod'],
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: `${name}.min.js`,
      format: 'umd',
      name: 'SpeechmaticsBatchClient',
      sourceMap: false,
    },
  };

  return [esModule, cjs, typeDefinitions, minified];
}
