// pay attention to the placing of the import statements, inside or outside the module definition
// with any top-level import or export statements, the declaration file acts as a module augmentation
// without, it acts as a replacement for the module definition
//
// here, we want to redefine, since tracked-toolbox does not have any definitions of its own

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
