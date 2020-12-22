export default interface Reader<F, T> {
  read: (from: F) => T;
}
