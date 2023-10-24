export type PollResult<T> =
  | { readonly state: 'pending' }
  | { readonly state: 'resolved'; readonly value: T };

/**
 *
 * @param cb polling function retuning a `PollResult`. If this rejects, then polling will stop, and the return promise rejects as well
 * @param interval number of milliseconds between each attempt, while still pending
 * @param timeout number of milliseconds after which to reject unconditionally
 * @returns a Promise which is fulfilled after a `resolved` state is returned from the function, or rejects if either the caller rejects, or timeout is exceeded
 */
export default function poll<T>(
  cb: () => Promise<PollResult<T>>,
  interval = 500,
  timeout = 60 * 1000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let pollInterval: ReturnType<typeof setInterval> | undefined = undefined;

    const errTimeout = setTimeout(() => {
      typeof pollInterval !== 'undefined' && clearInterval(pollInterval);
      reject(new Error(`Exceeded timeout of ${timeout} ms`));
    }, timeout);

    pollInterval = setInterval(() => {
      cb()
        .then((result) => {
          if (result.state === 'resolved') {
            clearTimeout(errTimeout);
            clearInterval(pollInterval);
            resolve(result.value);
          }
        })
        .catch((err) => {
          clearTimeout(errTimeout);
          clearInterval(pollInterval);
          reject(err);
        });
    }, interval);
  });
}
