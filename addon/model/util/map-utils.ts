export default class MapUtils {
  static copyMapContents<K, V>(from: Map<K, V>, to: Map<K, V>) {
    for (const [key, value] of from) {
      to.set(key, value);
    }
  }

  static areMapsSame<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
    if (map1.size !== map2.size) {
      return false;
    }

    for (const [key, value] of map1) {
      const otherVal = map2.get(key);
      if (otherVal !== value || (value === undefined && !map2.has(key))) {
        return false;
      }
    }

    return true;
  }
}
