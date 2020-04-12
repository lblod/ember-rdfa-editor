/**
 * Creates an instance of a native or classic class.
 *
 * This helper makes it a tad easier to convert from classic to native
 * classes.
 */
export default function makeNativeOrClassicInstance(klass, ...args) {
  if( klass.create ) {
    return klass.create(...args);
  } else {
    return new klass(...args);
  }
}
