export default class MapUtils {
  static areMapsSame<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
    if(map1.size !== map2.size) {
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
