import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' with { type: 'json' };

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  return [
    {
      plugins: [esbuild()],
      input: 'src/index.ts',
      output: [
        {
          file: packageJSON.module,
          format: 'es',
          sourcemap: true,
          strict: false,
          banner: '"use client";',
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
        file: `${packageJSON.module.replace('.js', '')}.d.ts`,
      },
    },
  ];
}
