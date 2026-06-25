/**
 * Calculate the set difference a - b between two sets
 *
 * @param a set a, or the left hand side of the operation
 * @param b set b, or the right hand sidde of the operation
 * @returns a-b
 */
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>();

  for (const item of a) {
    if (!b.has(item)) {
      diff.add(item);
    }
  }

  return diff;
}

export function addAll<T>(set: Set<T>, ...items: T[]) {
  items.forEach((item) => {
    set.add(item);
  });
}
