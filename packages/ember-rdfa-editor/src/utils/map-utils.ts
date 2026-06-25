export function mapObject<T, S>(
  obj: Record<string, T>,
  f: (entry: [string, T]) => [string, S],
) {
  return Object.fromEntries(Object.entries(obj).map(f));
}
