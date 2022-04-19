export default class SetUtils {
  static areSetsSame<I>(setA: Set<I>, setB: Set<I>): boolean {
    if (setA.size !== setB.size) {
      return false;
    }
    for (const elem of setA) {
      if (!setB.has(elem)) {
        return false;
      }
    }
    return true;
  }

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

  static hasAny<I>(set: Set<I>, ...items: I[]): boolean {
    if (!items.length) {
      return true;
    }
    for (const item of items) {
      if (set.has(item)) {
        return true;
      }
    }
    return false;
  }
}
