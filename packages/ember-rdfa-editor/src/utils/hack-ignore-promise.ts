export function hackIgnorePromise<A extends unknown[], R>(
  func: (...args: A) => Promise<R>,
): (...args: A) => R {
  // We wrongly pass an async function to focusTrap in various locations. This function only exists to lie about the types, so that we can keep the behavior, which might be relying on the broken configuration, the same. Ideally the passed funcion should not be async, or otherwise we should pass something else to focustrap
  //@ts-expect-error this is a temporary hack
  return func;
}
