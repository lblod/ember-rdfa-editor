type HashFunction<I> = (item: I) => unknown;

interface HashSetConfig<I> {
  init?: Iterable<I>;
  hashFunc?: HashFunction<I>;
}

function identity<I>(thing: I): I {
  return thing;
}

export default class HashSet<I> implements Set<I> {
  private items: Map<unknown, I> = new Map<unknown, I>();
  private readonly hashFunc: HashFunction<I>;

  constructor({ hashFunc = identity, init = [] }: HashSetConfig<I>) {
    this.hashFunc = hashFunc;
    for (const item of init) {
      this.add(item);
    }
  }

  get size(): number {
    return this.items.size;
  }

  get [Symbol.toStringTag](): string {
    return this.items[Symbol.toStringTag];
  }

  [Symbol.iterator](): IterableIterator<I> {
    return this.items.values();
  }

  add(...values: I[]): this {
    for (const value of values) {
      const key = this.hashFunc(value);
      this.items.set(key, value);
    }
    return this;
  }

  clear(): void {
    this.items.clear();
  }

  delete(...values: I[]): boolean {
    let didDelete = false;
    for (const value of values) {
      const key = this.hashFunc(value);
      didDelete = didDelete || this.items.delete(key);
    }
    return didDelete;
  }

  deleteHash(...hashes: unknown[]): boolean {
    let didDelete = false;
    for (const hash of hashes) {
      const deleted = this.items.delete(hash);
      didDelete = didDelete || deleted;
    }
    return didDelete;
  }

  entries(): IterableIterator<[I, I]> {
    return new Set<I>(this.items.values()).entries();
  }

  lookupHash(hash: unknown): I | null {
    return this.items.get(hash) || null;
  }

  forEach(
    callbackfn: (value: I, value2: I, set: Set<I>) => void,
    thisArg?: unknown
  ): void {
    this.items.forEach((value) => callbackfn(value, value, this), thisArg);
  }

  has(value: I): boolean {
    return this.items.has(this.hashFunc(value));
  }

  hasHash(hash: unknown) {
    return this.items.has(hash);
  }

  keys(): IterableIterator<I> {
    return this.items.values();
  }

  values(): IterableIterator<I> {
    return this.items.values();
  }

  intersection(other: HashSet<I>): HashSet<I> {
    const result = new HashSet<I>({ hashFunc: this.hashFunc });
    for (const item of this) {
      if (other.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  hasSameHashes(other: HashSet<I>): boolean {
    return (
      this.size === other.size && this.intersection(other).size === this.size
    );
  }

  clone(): HashSet<I> {
    return new HashSet<I>({ hashFunc: this.hashFunc, init: this });
  }
}
