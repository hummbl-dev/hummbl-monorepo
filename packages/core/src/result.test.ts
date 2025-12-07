import { describe, it, expect } from 'vitest';
import { Result, isOk, isErr } from './result';

describe('Result', () => {
  it('creates an Ok result', () => {
    const result = Result.ok('success');
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (result.ok) {
      expect(result.value).toBe('success');
    }
  });

  it('creates an Err result', () => {
    const error = new Error('failed');
    const result = Result.err(error);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
    if (!result.ok) {
      expect(result.error).toBe(error);
    }
  });

  describe('from', () => {
    it('creates Ok from successful function', () => {
      const result = Result.from(() => 'success');
      expect(isOk(result)).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('success');
      }
    });

    it('creates Err from throwing function', () => {
      const result = Result.from(() => {
        throw new Error('boom');
      });
      expect(isErr(result)).toBe(true);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
        expect((result.error as Error).message).toBe('boom');
      }
    });
  });

  describe('fromPromise', () => {
    it('creates Ok from resolved promise', async () => {
      const result = await Result.fromPromise(Promise.resolve('async success'));
      expect(isOk(result)).toBe(true);
    });

    it('creates Err from rejected promise', async () => {
      const result = await Result.fromPromise(Promise.reject(new Error('async fail')));
      expect(isErr(result)).toBe(true);
    });
  });
});
