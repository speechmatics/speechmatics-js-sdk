import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' with { type: 'json' };
const name = packageJSON.main.replace(/\.js$/, '');

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  return [
    {
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
          file: `${name}.js`,
          format: 'cjs',
          sourcemap: true,
        },
        {
          file: `${name}.mjs`,
          format: 'es',
          sourcemap: true,
        },
      ],
    },

    {
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
    },
  ];
}
