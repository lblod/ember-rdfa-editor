interface DebounceOpts {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

// adapted from Lodash implementation
export function debounced<A extends unknown[], R>(
  func: (...args: A) => R,
  delayMs: number,
  { leading = false, trailing = true, maxWait }: DebounceOpts = {},
) {
  let lastArgs: A | null = null;
  let lastThis: unknown;
  let result: R;
  let timerId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  const maxing = typeof maxWait === 'number';

  function invokeFunc(time: number): R {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as A) as R;
    return result;
  }

  function leadingEdge(time: number) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, delayMs);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall: number = time - Number(lastCallTime);
    const timeSinceLastInvoke: number = time - lastInvokeTime;
    const timeWaiting: number = delayMs - timeSinceLastCall;
    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    if (lastCallTime === null) {
      return true;
    }
    const timeSinceLastCall: number = time - lastCallTime;
    const timeSinceLastInvoke: number = time - lastInvokeTime; // Either this is the first call, activity has stopped and we're at the // trailing edge, the system time has gone backwards and we're treating // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      timeSinceLastCall >= delayMs ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): R | void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number): R {
    timerId = null;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return result;
  }

  function cancel() {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    lastThis = null;
    timerId = null;
  }

  function flush() {
    return timerId === null ? result : trailingEdge(Date.now());
  }

  function debounced(this: unknown, ...args: A) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, delayMs);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === null) {
      timerId = setTimeout(timerExpired, delayMs);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
