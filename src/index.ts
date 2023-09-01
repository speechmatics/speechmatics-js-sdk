export * from './client';
export * from './types';
export * from './realtime';
export * from './batch';

declare global {
  // This gets injected by ESBuild at compile time
  const SDK_VERSION: string;
}
