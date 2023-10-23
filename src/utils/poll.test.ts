import poll from './poll';

describe('poll', () => {
  it('resolves immediately with a resolved value', async () => {
    const cb = jest.fn(async () => ({
      state: 'resolved' as const,
      value: 'value',
    }));
    const result = await poll(cb);
    expect(result).toEqual('value');
    expect(cb).toBeCalledTimes(1);
  });

  it('calls the function repeatedly until it resolves', async () => {
    const states = (function* () {
      yield 'pending';
      yield 'pending';
      yield 'pending';
      yield 'resolved';
    })();

    const cb = jest.fn(async () => {
      const state = states.next().value;
      if (!state) throw new Error('called too many times');

      return state === 'pending'
        ? ({ state: 'pending' } as const)
        : ({ state: 'resolved', value: 'value' } as const);
    });

    const result = await poll(cb);
    expect(result).toEqual('value');
    expect(cb).toBeCalledTimes(4);
  });

  it('rejects if the callback does not resolve within the timeout', async () => {
    const cb = jest.fn(async () => {
      return { state: 'pending' } as const;
    });
    expect(async () => await poll(cb, 500, 1000)).rejects.toBeInstanceOf(Error);
  });

  it('stops polling if the callback rejects', async () => {
    // Pending for 3 calls, then rejection
    const states = (function* () {
      yield 'pending' as const;
      yield 'pending' as const;
      yield 'pending' as const;
    })();

    const cb = jest.fn(async () => {
      const state = states.next().value;
      if (!state) throw new Error('rejection');
      return { state };
    });
    const p = poll(cb, 500, 1000);
    expect(p).rejects.toBeInstanceOf(Error);
    p.finally(() => {
      expect(cb).toBeCalledTimes(4);
    });
  });
});
