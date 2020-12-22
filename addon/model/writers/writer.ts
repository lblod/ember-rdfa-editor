export default interface Writer<F, T> {
  write: (richElement: F) => T;
};
