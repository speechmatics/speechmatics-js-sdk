export default async function waitUntilAvail(
  predicate: (() => boolean) | (() => Promise<boolean>),
  interval = 500,
  timeout: number = 60 * 1000,
): Promise<void> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const intv = setInterval(() => {
      const result = predicate();
      if (result instanceof Promise) {
        result.then((res) => {
          if (res) {
            clearInterval(intv);
            resolve();
          }
        });
      } else {
        if (result) {
          clearInterval(intv);
          resolve();
        }
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(intv);
        reject();
      }
    }, interval);
  });
}
