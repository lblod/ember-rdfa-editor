// from https://stackoverflow.com/a/52731696
type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;
export type Promisify<F> = F extends (...args: infer Args) => infer Result
  ? (...args: Args) => Promise<UnpackedPromise<Result>>
  : never;
