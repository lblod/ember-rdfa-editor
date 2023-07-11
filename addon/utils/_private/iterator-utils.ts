export function single<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean = () => true,
): T | undefined {
  let matchCount = 0;
  let result = undefined;
  for (const item of iterable) {
    if (predicate(item)) {
      if (matchCount === 1)
        throw new Error('Iterable contains more than one item');
      matchCount++;
      result = item;
    }
  }
  return result;
}
