export default class MapUtils {
  static setOrPush<K, V>(map: Map<K, V[]>, key: K, value: V) {
    const arr = map.get(key);
    if (!arr) {
      map.set(key, [value]);
    } else {
      arr.push(value);
    }
  }
  static setOrAdd<K, V>(map: Map<K, Set<V>>, key: K, value: V) {
    const set = map.get(key);
    if (!set) {
      map.set(key, new Set([value]));
    } else {
      set.add(value);
    }
  }
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
