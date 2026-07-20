import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // Load the PCM audio worklet as an asset: Turbopack emits the file and
      // the import resolves to its URL (webpack `asset/resource` equivalent),
      // which is passed to `audioWorklet.addModule()`.
      '**/pcm-audio-worklet.min.js': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
