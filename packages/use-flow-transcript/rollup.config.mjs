import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' with { type: 'json' };
import preserveDirectives from 'rollup-plugin-preserve-directives';
const CJS_TARGET = packageJSON.main;

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  return [
    {
      plugins: [
        esbuild(),
        preserveDirectives({
          suppressPreserveModulesWarning: true,
        }),
      ],
      input: 'src/index.ts',
      output: [
        {
          file: CJS_TARGET,
          format: 'cjs',
          sourcemap: true,
        },
        {
          // For the ESM output we preserve modules because some will need the "use client" directive
          dir: 'dist/',
          format: 'es',
          sourcemap: true,
          preserveModules: true,
          strict: false,
        },
      ],
    },

    {
      plugins: [
        dts({
          compilerOptions: {
            removeComments: false,
          },
        }),
      ],
      input: 'src/index.ts',
      output: {
        file: `${CJS_TARGET.replace('.cjs', '')}.d.ts`,
      },
    },
  ];
}
