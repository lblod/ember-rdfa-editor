/**
 * Compare two objects for equality using a simple equality check for values
 */
export function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
) {
  const aEntries = Object.entries(a);
  return (
    aEntries.length === Object.entries(b).length &&
    aEntries.every(([key, val]) => val === b[key])
  );
}
