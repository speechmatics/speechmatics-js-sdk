# Speechmatics JS SDK — CLAUDE.md

This file describes the repository structure, conventions, and common workflows for AI-assisted development.

## Repository overview

Monorepo containing official Speechmatics JavaScript/TypeScript libraries, published to NPM under the `@speechmatics` scope.

- **Package manager**: pnpm v9.15.4 (via Corepack)
- **Node version**: ≥ 22 (see `.nvmrc`)
- **Build tool**: Rollup + esbuild (TypeScript via `rollup-plugin-esbuild`, types via `rollup-plugin-dts`)
- **Linter / formatter**: Biome v1.9.4 (replaces ESLint + Prettier)
- **Versioning / changelogs**: `@changesets/cli`
- **Language**: TypeScript (strict mode, ESNext target)

## Workspace layout

```
packages/
  auth/                      # JWT generation for browser clients
  batch-client/              # HTTP client for batch transcription jobs
  real-time-client/          # WebSocket client for real-time transcription
  flow-client/               # WebSocket client for Flow (voice assistant) API
  browser-audio-input/       # AudioWorklet-based PCM capture + device management
  web-pcm-player/            # PCM audio playback (Int16 / Float32)
  real-time-client-react/    # React hooks/context for real-time-client
  flow-client-react/         # React hooks/context for flow-client
  browser-audio-input-react/ # React hooks/context for browser-audio-input
  web-pcm-player-react/      # React hooks/context for web-pcm-player
  use-flow-transcript/       # React hook for Flow conversation transcripts (pre-release)

examples/
  nextjs-real-time-transcription/
  nextjs-flow/
  nodejs/
  react-native-flow/
```

## Package anatomy

Every package under `packages/` follows the same pattern:

```
src/index.ts        ← public API surface
rollup.config.mjs   ← builds dist/*.js (CJS), dist/*.mjs (ESM), dist/*.d.ts
package.json        ← independent semver version
```

Build outputs go to `dist/`. Each package injects `SDK_VERSION` at build time via `@rollup/plugin-inject`.

React packages (`*-react`) use `rollup-plugin-preserve-directives` to keep `"use client"` directives intact for Next.js.

## Common commands

```sh
# Install all workspace dependencies
pnpm i

# Build all packages
pnpm build:packages

# Lint (with auto-fix)
pnpm lint

# Format (with auto-fix)
pnpm format

# Check lint/format without writing
pnpm lint:check
pnpm format:check

# Remove all node_modules
pnpm clean:deps

# Remove all dist/ directories
pnpm clean:builds

# Publish all packages (CI only — requires provenance/NPM token)
pnpm publish:packages
```

Individual package builds:

```sh
pnpm --filter @speechmatics/real-time-client build
```

## Key packages explained

### `@speechmatics/auth`
Generates short-lived JWTs using a long-lived API key. Intended to be called server-side and the JWT passed to the browser. Supports types: `batch`, `rt`, `flow`, `tts`; regions: `eu`, `usa`, `au`.

### `@speechmatics/batch-client`
HTTP client for the Speechmatics Jobs API. Uses Zod for response validation. Code-generated models live alongside hand-written client code.

### `@speechmatics/real-time-client`
WebSocket client for streaming audio. Built on `EventTarget` (web standard). Uses the `ws` library for Node.js compatibility; browser build uses native WebSocket. Ships both a CJS build (for Node) and an ESM browser build.

### `@speechmatics/flow-client`
WebSocket client for the Flow conversational AI API. Same `EventTarget` pattern as `real-time-client`. Supports persona selection and raw PCM audio (`pcm_s16le` / `pcm_f32le`).

### `@speechmatics/browser-audio-input`
AudioWorklet-based PCM recorder. Exports a `PCMRecorder` class and `getAudioDevicesStore()` for reactive device enumeration. Also exports `pcm-audio-worklet.min.js` as a separate bundle (the worklet script must be loaded from a URL by the caller).

### `@speechmatics/web-pcm-player`
Plays PCM audio chunks via the Web Audio API. Supports scheduled playback, volume control (GainNode), and audio analysis (AnalyserNode).

### React packages
Each `*-react` package re-exports its corresponding non-React package and adds:
- A `Provider` component (context)
- Typed hooks (`useX`, `useXEventListener`)

Peer dependencies: React ^18 || ^19.

## TypeScript conventions

- Strict mode is on everywhere.
- Module resolution: `bundler` (set in root `tsconfig.json`).
- `allowSyntheticDefaultImports` is enabled.
- Do not add `// @ts-ignore` — fix the type properly.

## Code style (Biome)

- Single quotes in JS/TS.
- 2-space indentation.
- Organised imports are **disabled** — do not sort imports automatically.
- Ignore patterns: `dist/`, `.next/`, `node_modules/`.

Biome replaces ESLint and Prettier. Do not install or configure either.

## Testing

Tests live inside individual packages. The CI pipeline runs tests with an `API_KEY` secret injected as an environment variable. When running tests locally you need to set `API_KEY` (or `SPEECHMATICS_API_KEY`) in your shell.

## CI / CD

- **CI** (`ci.yml`): triggered on push to `main` and on PRs targeting `main`. Runs lint/format checks then tests.
- **CD** (`cd.yml`): triggered on push to `main`. Builds all packages then publishes to NPM with provenance (trusted publish).

Releases are managed with `@changesets/cli`. To prepare a release, run `pnpm changeset` and commit the generated changeset file with your PR.

## Authentication model

| Approach | When to use |
|---|---|
| Long-lived API key | Server-side / trusted environments |
| Short-lived JWT (`@speechmatics/auth`) | Browser / untrusted environments |

API keys are generated at [portal.speechmatics.com/api-keys](https://portal.speechmatics.com/api-keys).

## Runtime targets

All packages target web-standard APIs (EventTarget, WebSocket, AudioContext, etc.) so they work in browsers, React Native, Node.js ≥ 22, Deno, Bun, and Cloudflare Workers. The `ws` package provides the WebSocket implementation for non-browser runtimes. React Native callers must supply `event-target-polyfill`.

## Adding a new package

1. Create `packages/<name>/` with `src/index.ts`, `package.json`, and `rollup.config.mjs` following the pattern of an existing package.
2. Add the package to `pnpm-workspace.yaml` if needed (usually picked up automatically by the `packages/*` glob).
3. Register any workspace dependency with `pnpm --filter @speechmatics/<name> add @speechmatics/<dep> --workspace`.
4. Run `pnpm i` from the root to link everything.

## Useful links

- [Speechmatics docs](https://docs.speechmatics.com/)
- [Real-time API reference](https://docs.speechmatics.com/rt-api-ref)
- [Batch API reference](https://docs.speechmatics.com/jobsapi)
- [Flow API getting started](https://docs.speechmatics.com/flow/getting-started)
- [Portal](https://portal.speechmatics.com/)
- [NPM org](https://www.npmjs.com/org/speechmatics)
