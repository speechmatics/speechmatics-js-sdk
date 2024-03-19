export * from './client';
export * from './types';
export * from './realtime';
export * from './batch';
export * from './utils/errors';

declare global {
  // This gets injected by ESBuild at compile time
  const SDK_VERSION: string;
}
