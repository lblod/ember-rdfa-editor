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

  static addMany<I>(set: Set<I>, ...items: I[]): Set<I> {
    let result = set;
    for (const item of items) {
      result = set.add(item);
    }
    return result;
  }

  static deleteMany<I>(set: Set<I>, ...items: I[]): boolean {
    let didDelete = false;
    for (const item of items) {
      const deleted = set.delete(item);
      didDelete = didDelete || deleted;
    }
    return didDelete;
  }
}
