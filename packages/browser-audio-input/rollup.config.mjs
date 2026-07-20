import esbuildPlugin from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import packageJSON from './package.json' with { type: 'json' };

// Based on gist
//https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226

/** @returns {import("rollup").RollupOptions[]} */
export default function rollup() {
  const esm = {
    plugins: [esbuildPlugin()],
    input: 'src/index.ts',
    output: {
      file: packageJSON.module,
      format: 'es',
      strict: false,
    },
  };

  const minified = {
    plugins: [
      esbuildPlugin({
        minify: true,
        optimizeDeps: {
          include: ['typescript-event-target'],
        },
      }),
    ],
    input: 'src/index.ts',
    output: {
      file: packageJSON.module.replace(/\.js$/, '.min.js'),
      name: 'BrowserAudioInput',
      format: 'umd',
      strict: false,
    },
  };

  // The worklet is consumed as an asset (a URL passed to
  // `audioWorklet.addModule()`), not imported as a JS module. Emit a matching
  // declaration so bundlers that resolve the `./pcm-audio-worklet.min.js`
  // subpath as an asset (e.g. Turbopack `asset`, webpack `asset/resource`) get
  // a typed string URL without consumers writing their own `declare module`.
  /** @type {import("rollup").Plugin} */
  const emitWorkletTypes = {
    name: 'emit-worklet-types',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'pcm-audio-worklet.min.d.ts',
        source: [
          '/** URL of the compiled PCM audio worklet, for `AudioWorklet.addModule()`. */',
          'declare const workletScriptURL: string;',
          'export default workletScriptURL;',
          '',
        ].join('\n'),
      });
    },
  };

  const audioWorklet = {
    plugins: [
      esbuildPlugin({
        minify: true,
      }),
      emitWorkletTypes,
    ],
    input: 'src/worklets/pcm-audio-worklet.ts',
    output: {
      file: 'dist/pcm-audio-worklet.min.js',
      format: 'umd',
      name: 'PCMAudioProcessor',
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

  return [esm, minified, audioWorklet, typeDefinitions];
}
