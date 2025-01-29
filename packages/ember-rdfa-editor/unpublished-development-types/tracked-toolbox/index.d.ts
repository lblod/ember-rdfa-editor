declare module 'tracked-toolbox' {
  export function localCopy<T>(
    memo: string,
    initializer?: T | (() => T),
  ): PropertyDecorator;
  export function trackedReset(memo: string): PropertyDecorator;
  export function trackedReset<C, T>(args: {
    memo: string;
    update: (component: C, key: string, last: T) => T;
  }): PropertyDecorator;
}
