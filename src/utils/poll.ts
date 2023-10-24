export type PollResult<T> =
  | { readonly state: 'pending' }
  | { readonly state: 'resolved'; readonly value: T };

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
