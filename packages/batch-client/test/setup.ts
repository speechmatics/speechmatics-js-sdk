// `SDK_VERSION` is normally templated in by the build (esbuild `define`).
// For tests we set it on the global so `request.ts` can resolve it at runtime.
(globalThis as Record<string, unknown>).SDK_VERSION = '0.0.0-test';
