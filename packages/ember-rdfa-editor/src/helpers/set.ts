export default <T extends string, U>(
  obj: Record<T, U>,
  propName: T,
  value?: U,
) => {
  if (value === undefined) {
    return (innerValue: U) => {
      obj[propName] = innerValue;
    };
  } else {
    return () => {
      obj[propName] = value;
    };
  }
};
