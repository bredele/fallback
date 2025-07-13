type AsyncCallback<T, R> = (data: T) => Promise<R>;

/**
 * Creates a fallback function that executes async callbacks sequentially until one succeeds.
 *
 * The returned function will try each callback in order, moving to the next one only if
 * the current callback throws an error. If all callbacks fail, an AggregateError is thrown
 * containing all individual errors for debugging and logging purposes.
 */

export default <T, R>(
  callbacks: AsyncCallback<T, R>[]
): ((data: T) => Promise<R>) => {
  return async (data: T): Promise<R> => {
    if (callbacks.length === 0) {
      throw new Error("No callbacks provided");
    }

    const errors: unknown[] = [];

    for (let i = 0; i < callbacks.length; i++) {
      try {
        const callback = callbacks[i];
        const result = await callback(data);
        return result;
      } catch (error) {
        errors.push(error);
      }
    }

    throw new AggregateError(errors, 'All fallback callbacks failed');
  };
};
