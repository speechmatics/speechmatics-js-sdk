import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';

// This hook provides a basic way to fetch temporary JWTs on the fly.
// Due to some restrictions of Remix, it is a bit of a workaround.
// At time of writing, Remix still doesn't have a good way to await fetch/loaded data from within a callback
// This is due to its philosophy of minimizing data waterfalls, which is understandable.
// However, since there is a need for React 19 transitions compatibility, this feature is being worked on:
// https://github.com/orgs/remix-run/projects/5?pane=issue&itemId=62177552
// TODO: Once the above feature lands in Remix, update this hook to use that instead.
export function useSpeechmaticsJWT(type: 'flow' | 'rt') {
  const fetcher = useFetcher<{ jwt: string }>();
  const resolveRef = useRef<(value: string) => void>();

  useEffect(() => {
    if (resolveRef.current && fetcher.data) {
      resolveRef.current?.(fetcher.data.jwt);
      resolveRef.current = undefined;
    }
  }, [fetcher.data]);

  return useCallback(async () => {
    const fd = new FormData();
    fd.set('type', type);

    // @ts-ignore: This is widely available on browsers
    const { promise, resolve } = Promise.withResolvers();
    resolveRef.current = resolve;

    fetcher.submit(fd, { action: '/jwt', method: 'post' });
    return (await promise) as string;
  }, [fetcher, type]);
}
