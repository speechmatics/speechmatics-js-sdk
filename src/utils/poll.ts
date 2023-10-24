/**
 *
 * @param cb polling function retuning a boolean (`false` if pending, `true` if resolved). If this rejects, then polling will stop, and the return promise rejects as well
 * @param interval number of milliseconds between each attempt, while still pending
 * @param timeout number of milliseconds after which to reject unconditionally
 * @returns a Promise which is fulfilled after a `resolved` state is returned from the function, or rejects if either the caller rejects, or timeout is exceeded
 */
export default function poll(
  cb: () => Promise<boolean>,
  interval = 500,
  timeout = 60 * 1000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let pollInterval: ReturnType<typeof setInterval> | undefined = undefined;

    const errTimeout = setTimeout(() => {
      typeof pollInterval !== 'undefined' && clearInterval(pollInterval);
      reject(new Error(`Exceeded timeout of ${timeout} ms`));
    }, timeout);

    pollInterval = setInterval(() => {
      cb()
        .then((resolved) => {
          if (resolved) {
            clearTimeout(errTimeout);
            clearInterval(pollInterval);
            resolve();
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
