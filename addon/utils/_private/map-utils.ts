import { unwrap } from './option';

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

  static hasAny<K, V>(map: Map<K, V>, ...keys: K[]): boolean {
    if (!keys.length) {
      return true;
    }
    for (const key of keys) {
      if (map.has(key)) {
        return true;
      }
    }
    return false;
  }
}

type HashFunction<I, V> = (item: I) => V;
interface TwoWayMapArgs<K, V, HK = K, HV = V> {
  valueHasher: HashFunction<V, HV>;
  keyHasher: HashFunction<K, HK>;
  init?: Iterable<[K, V]>;
}
export class TwoWayMap<K, V, HK = K, HV = V> implements Map<K, V> {
  private keyToValue: Map<HK, V>;
  private valueToKey: Map<HV, K>;
  private valueHasher: HashFunction<V, HV>;
  private keyHasher: HashFunction<K, HK>;
  static withIdentityHashing<K, V>({
    init = [],
  }: Pick<TwoWayMapArgs<K, V>, 'init'> = {}): TwoWayMap<K, V> {
    return new TwoWayMap({
      valueHasher: (val) => val,
      keyHasher: (key) => key,
      init,
    });
  }
  static withValueStringHashing<K, V>({
    valueHasher,
    init,
  }: Pick<TwoWayMapArgs<K, V, K, string>, 'valueHasher' | 'init'>): TwoWayMap<
    K,
    V,
    K,
    string
  > {
    return new TwoWayMap({ valueHasher, keyHasher: (key) => key, init });
  }
  constructor({
    valueHasher,
    keyHasher,
    init = [],
  }: TwoWayMapArgs<K, V, HK, HV>) {
    this.keyToValue = new Map();
    this.valueToKey = new Map();
    this.valueHasher = valueHasher;
    this.keyHasher = keyHasher;
    for (const [key, val] of init) {
      this.set(key, val);
    }
  }
  clear(): void {
    this.keyToValue.clear;
    this.valueToKey.clear;
  }
  delete(key: K): boolean {
    const hashedKey = this.keyHasher(key);
    const value = this.keyToValue.get(hashedKey);
    if (value) {
      this.keyToValue.delete(hashedKey);
      this.valueToKey.delete(this.valueHasher(value));
      return true;
    } else {
      return false;
    }
  }
  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void {
    this.keyToValue.forEach((value) => {
      const key = unwrap(this.valueToKey.get(this.valueHasher(value)));
      callbackfn(value, key, this);
    }, thisArg);
  }
  get(key: K): V | undefined {
    return this.keyToValue.get(this.keyHasher(key));
  }
  getValue(val: V): K | undefined {
    return this.valueToKey.get(this.valueHasher(val));
  }
  has(key: K): boolean {
    return this.keyToValue.has(this.keyHasher(key));
  }
  hasValue(val: V): boolean {
    return this.valueToKey.has(this.valueHasher(val));
  }
  set(key: K, value: V): this {
    this.keyToValue.set(this.keyHasher(key), value);
    this.valueToKey.set(this.valueHasher(value), key);
    return this;
  }
  get size() {
    return this.keyToValue.size;
  }
  *entries(): IterableIterator<[K, V]> {
    for (const [_hashedKey, value] of this.keyToValue.entries()) {
      yield [unwrap(this.valueToKey.get(this.valueHasher(value))), value];
    }
  }
  keys(): IterableIterator<K> {
    return this.valueToKey.values();
  }
  values(): IterableIterator<V> {
    return this.keyToValue.values();
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
  get [Symbol.toStringTag](): string {
    return this.keyToValue.toString();
  }
}
