import { AssertionError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

export type None = null | undefined;
export type Option<A> = A | None;

export function expect<A>(msg: string, thing: Option<A>): A {
  if (!isSome(thing)) {
    throw new AssertionError(msg);
  }
  return thing;
}

export function unwrap<A>(thing: Option<A>): A {
  return expect('Unwrapped a null or undefined value!', thing);
}

export function unwrapOr<A>(defaultValue: A, thing: Option<A>): A {
  if (isSome(thing)) {
    return thing;
  }
  return defaultValue;
}

export function optionMap<A, U>(
  func: (thing: A) => U,
  thing: Option<A>,
): Option<U> {
  if (isSome(thing)) {
    return func(thing);
  }
  return thing;
}

export function optionMapOr<A, U>(
  defaultValue: U,
  func: (thing: A) => U,
  thing: Option<A>,
): U {
  if (isSome(thing)) {
    return func(thing);
  }
  return defaultValue;
}

export function isSome<A>(thing: Option<A>): thing is A {
  return thing !== null && thing !== undefined;
}

export function isNone<A>(thing: Option<A>): thing is None {
  return !isSome(thing);
}
