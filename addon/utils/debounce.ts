export default function debounced<A extends unknown[], R>(callback: (...args: A) => R, delayMs: number) {
  let timer: NodeJS.Timeout;
  return function (...args: A): R | undefined {
    clearTimeout(timer);
    let rslt: R | undefined;
    timer = setTimeout(function (this: unknown) {
      rslt = callback.apply(this, ...args);
    }, delayMs);
    return rslt;
  };

}
