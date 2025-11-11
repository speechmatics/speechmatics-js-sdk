import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import inject from '@rollup/plugin-inject';

import packageJSON from './package.json' with { type: 'json' };
const name = packageJSON.main.replace(/\.js$/, '');

export default function rollup() {
  const browserESM = {
    plugins: [
      esbuild({
        define: {
          SDK_VERSION: `'${packageJSON.version}'`,
        },
      }),
    ],
    input: 'src/index.ts',
    output: [
      {
        file: `${name}.browser.js`,
        format: 'es',
        sourcemap: true,
      },
    ],
  };

  const nodeCJS = {
    plugins: [
      esbuild({
        define: {
          SDK_VERSION: `'${packageJSON.version}'`,
        },
      }),
      inject({
        WebSocket: ['ws', 'WebSocket'],
      }),
    ],
    input: 'src/index.ts',
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
      },
    ],
  };

  const typeDefinitions = {
    plugins: [
      dts({
        compilerOptions: {
          removeComments: false,
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: `${name}.d.ts`,
    },
  };

  return [browserESM, nodeCJS, typeDefinitions];
}
