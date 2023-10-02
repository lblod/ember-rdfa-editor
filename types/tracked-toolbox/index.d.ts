import Component from '@glimmer/component';

declare module 'tracked-toolbox' {
  export function localCopy<C extends Component, T = unknown>(
    memo: keyof C,
    initializer?: T | (() => T),
  ): PropertyDecorator;
  export function trackedReset<C extends Component>(
    memo: keyof C,
  ): PropertyDecorator;
  export function trackedReset<C extends Component, T = unknown>(args: {
    memo: keyof C;
    update: (component: C, key: string, last: T) => T;
  }): PropertyDecorator;
}
