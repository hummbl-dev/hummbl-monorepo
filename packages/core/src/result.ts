// Using DE3 (Decomposition) to isolate Result helpers for consistent error handling
interface ResultOk<T> {
  ok: true;
  value: T;
}

interface ResultErr<E> {
  ok: false;
  error: E;
}

export type Result<T, E = Error> = ResultOk<T> | ResultErr<E>;

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),

  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),

  fromPromise: async <T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (error: unknown) => E
  ): Promise<Result<T, E>> => {
    try {
      const data = await promise;
      return Result.ok(data);
    } catch (error) {
      const mappedError = errorMapper ? errorMapper(error) : (error as E);
      return Result.err(mappedError);
    }
  },

  from: <T, E = Error>(fn: () => T): Result<T, E> => {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error as E);
    }
  },
};

export const isOk = <T, E>(result: Result<T, E>): result is ResultOk<T> => result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is ResultErr<E> => !result.ok;
