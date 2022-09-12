/**
 * Interface for writers, which can convert between a model element and a dom element
 */
export default interface Writer<F, T> {
  write: (richElement: F) => T;
}
