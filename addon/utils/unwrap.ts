import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';

function unwrap<A>(thing?: A | null): NonNullable<A> {
  if (thing === undefined || thing === null) {
    throw new AssertionError('Unwrapped a null or undefined value!');
  }
  return thing;
}

export default unwrap;
