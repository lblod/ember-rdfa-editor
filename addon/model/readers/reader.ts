/**
 * Generic interface for a Reader, which can convert from a document element to a model element
 */
export default interface Reader<F, T, C> {
  read: (from: F, context: C) => T;
}
