import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' assert { type: 'json' };

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  const esm = {
    plugins: [esbuild()],
    input: 'src/index.ts',
    output: {
      file: packageJSON.module,
      format: 'es',
      strict: false,
    },
  };

  const cjs = {
    plugins: [esbuild()],
    input: 'src/index.ts',
    output: {
      file: packageJSON.main,
      format: 'cjs',
    },
  };

  const minified = {
    plugins: [
      esbuild({
        minify: true,
        optimizeDeps: {
          include: ['typescript-event-target'],
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: packageJSON.module.replace(/\.js$/, '.min.js'),
      name: 'DiarizedTranscription',
      format: 'umd',
      strict: false,
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
      file: packageJSON.module.replace(/\.js$/, '.d.ts'),
    },
  };

  return [esm, minified, cjs, typeDefinitions];
}
