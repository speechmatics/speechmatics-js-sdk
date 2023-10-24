import poll from './poll';

describe('poll', () => {
  it('resolves immediately with a resolved value', async () => {
    const cb = jest.fn(async () => true);
    await expect(poll(cb)).resolves.toBeUndefined();
    expect(cb).toBeCalledTimes(1);
  });

  it('calls the function repeatedly until it resolves', async () => {
    const states = (function* () {
      yield false;
      yield false;
      yield false;
      yield true;
    })();

    const cb = jest.fn(async () => {
      const resolved = states.next().value;
      if (typeof resolved === 'undefined')
        throw new Error('called too many times');

      return resolved;
    });

    await expect(poll(cb)).resolves.toBeUndefined();
    expect(cb).toBeCalledTimes(4);
  });

  it('rejects if the callback does not resolve within the timeout', async () => {
    const cb = jest.fn(async () => false);
    expect(async () => await poll(cb, 500, 1000)).rejects.toBeInstanceOf(Error);
  });

  it('stops polling if the callback rejects', async () => {
    // Pending for 1 call, then rejection
    const states = (function* () {
      yield false;
    })();

    const err = new Error('explicit rejection');

    const cb = jest.fn(async () => {
      const resolved = states.next().value;
      if (typeof resolved === 'undefined') throw err;
      return resolved;
    });
    await expect(poll(cb)).rejects.toBe(err);
    expect(cb).toBeCalledTimes(2);
  });
});
