type HashFunction<I> = (item: I) => unknown;

interface HashSetConfig<I> {
  hashFunc?: HashFunction<I>;
}

function identity<I>(thing: I): I {
  return thing;
}

export default class HashSet<I> implements Set<I> {
  private items = new Set<I>();
  private hashes = new Set<unknown>();
  private readonly hashFunc: HashFunction<I>;

  constructor({ hashFunc = identity }: HashSetConfig<I>) {
    this.hashFunc = hashFunc;
  }

  get size(): number {
    return this.items.size;
  }

  get [Symbol.toStringTag](): string {
    return this.items[Symbol.toStringTag];
  }

  [Symbol.iterator](): IterableIterator<I> {
    return this.items[Symbol.iterator]();
  }

  add(value: I): this {
    const prop = this.hashFunc(value);
    if (!this.hashes.has(prop)) {
      this.items.add(value);
      this.hashes.add(prop);
    }
    return this;
  }

  clear(): void {
    this.items.clear();
    this.hashes.clear();
  }

  delete(value: I): boolean {
    this.items.delete(value);
    return this.hashes.delete(this.hashFunc(value));
  }

  entries(): IterableIterator<[I, I]> {
    return this.items.entries();
  }

  forEach(
    callbackfn: (value: I, value2: I, set: Set<I>) => void,
    thisArg?: unknown
  ): void {
    this.items.forEach(callbackfn, thisArg);
  }

  has(value: I): boolean {
    return this.hashes.has(this.hashFunc(value));
  }

  keys(): IterableIterator<I> {
    return this.items.keys();
  }

  values(): IterableIterator<I> {
    return this.items.values();
  }
}
