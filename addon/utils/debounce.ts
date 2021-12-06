export function debounced<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number
): (...args: A) => void {
  let timer: NodeJS.Timeout;
  return function (...args: A): void {
    clearTimeout(timer);
    timer = setTimeout(function (this: unknown) {
      callback.apply(this, args);
    }, delayMs);
  };
}

export function debouncedAdjustable<A extends unknown[]>(
  callback: (...args: A) => void
): (delayMs: number, ...args: A) => void {
  let timer: NodeJS.Timeout;
  return function (delayMs: number, ...args: A): void {
    clearTimeout(timer);
    timer = setTimeout(function (this: unknown) {
      callback.apply(this, args);
    }, delayMs);
  };
}
