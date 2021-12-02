export default class SetUtils {
  /**
   * Calculates A / B in set arithmetic
   */
  static difference<I>(setA: Set<I>, setB: Set<I>): Set<I> {
    const difference = new Set(setA);
    for (const elem of setB) {
      difference.delete(elem);
    }
    return difference;
  }
}
