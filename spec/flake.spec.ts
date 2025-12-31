import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('getmac', () => ({
  default: () => '00:00:00:00:00:01'
}));

import {
  bigIntTo62,
  getBase62Provider,
  getBase36Provider,
  getBigIntIdProviderWithNodeId,
} from '../src/index';

describe('bigIntTo62', () => {
  it('pads to 22 characters', () => {
    const value = bigIntTo62(1n);
    expect(value).toHaveLength(22);
    expect(value.endsWith('1')).toBe(true);
  });

  it('preserves lexicographic ordering for increasing values', () => {
    const first = bigIntTo62(10n);
    const second = bigIntTo62(11n);
    expect(first < second).toBe(true);
  });
});

describe('getBigIntIdProviderFromMac', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('increments sequence within the same millisecond', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const provider = getBigIntIdProviderWithNodeId(0x01n);

    const first = provider();
    const second = provider();

    expect(second - first).toBe(1n);
    nowSpy.mockRestore();
  });

  it('advances when time moves forward', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1700000000000).mockReturnValueOnce(1700000000001);

    const provider = getBigIntIdProviderWithNodeId(0x01n);
    const first = provider();
    const second = provider();

    expect(second > first).toBe(true);
    nowSpy.mockRestore();
  });
});

describe('getBase62Provider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 22 character ids', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const provider = getBase62Provider();

    const first = provider();
    const second = provider();

    expect(first).toHaveLength(22);
    expect(second).toHaveLength(22);
    expect(first).not.toBe(second);
    expect(first < second).toBe(true);
  });
});

describe('getBase36Provider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 22 character ids', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const provider = getBase36Provider();

    const first = provider();
    const second = provider();

    expect(first).toHaveLength(25);
    expect(second).toHaveLength(25);
    expect(first).not.toBe(second);
    expect(first < second).toBe(true);
  });
});

describe('timing test', () => {
  const count = 100_000;
  it(`generates ${count} ids in under a second`, () => {
    const provider = getBase62Provider();
    
    // check to ensure that the ids are unique and ordered as expected
    // initialize the array to hold generated ids
    const start = Date.now();
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
      ids.push(provider());
    }
    const end = Date.now();
    expect(end - start).toBeLessThan(1000);
    console.log(`Generated ${count} ids in ${end - start} ms`);
    expect(ids.length).toBe(count);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(count);
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i - 1] < ids[i]).toBe(true);
    }
  });
});
