export function poll(
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
