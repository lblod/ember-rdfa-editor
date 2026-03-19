import type * as RDF from '@rdfjs/types';
import N3 from 'n3';

function isN3Store(thing: unknown): thing is N3.Store {
  return thing instanceof N3.Store;
}

function isN3StoreWrapper(thing: unknown): thing is N3StoreWrapper {
  return thing instanceof N3StoreWrapper;
}

type QuadDataSet = RDF.Dataset<RDF.Quad, RDF.Quad>;

/**
 * Spec-compliant wrapper for n3
 */
export class N3StoreWrapper implements QuadDataSet {
  private _store: N3.Store;

  constructor(
    quadsOrStore?: RDF.Dataset | RDF.Quad[] | N3.Store | N3StoreWrapper,
  ) {
    if (isN3Store(quadsOrStore)) {
      this._store = quadsOrStore;
    } else if (isN3StoreWrapper(quadsOrStore)) {
      this._store = quadsOrStore._store;
    } else {
      this._store = new N3.Store();
      if (quadsOrStore) {
        this._store.addAll(quadsOrStore);
      }
    }
  }

  get size(): number {
    return this._store.size;
  }

  add(quad: RDF.Quad): this {
    this._store.add(quad);
    return this;
  }

  delete(quad: RDF.Quad): this {
    this._store.delete(quad);
    return this;
  }

  has(quad: RDF.Quad): boolean {
    return this._store.has(quad);
  }

  match(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): N3StoreWrapper {
    return new N3StoreWrapper(
      // @ts-expect-error the n3 types don't fully follow the RDFJs spec
      this._store.match(subject, predicate, object, graph),
    );
  }

  addAll(quads: QuadDataSet | RDF.Quad[]): this {
    this._store.addAll(quads);
    return this;
  }

  contains(other: QuadDataSet): boolean {
    return this.intersection(other).size === other.size;
  }

  deleteMatches(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): this {
    // @ts-expect-error the n3 types don't fully follow the RDFJs spec
    this._store.deleteMatches(subject, predicate, object, graph);
    return this;
  }

  difference(other: QuadDataSet): N3StoreWrapper {
    return new N3StoreWrapper(this._store.difference(other));
  }

  equals(other: RDF.Dataset<RDF.Quad, RDF.Quad>): boolean {
    return this._store.equals(other);
  }

  every(iteratee: (quad: RDF.Quad, dataset: this) => boolean): boolean {
    for (const quad of this) {
      if (!iteratee(quad, this)) {
        return false;
      }
    }
    return true;
  }

  filter(iteratee: (quad: RDF.Quad, dataset: this) => boolean): N3StoreWrapper {
    return new N3StoreWrapper(
      this._store.filter((quad) => iteratee(quad, this)),
    );
  }

  forEach(iteratee: (quad: RDF.Quad, dataset: this) => void): void {
    this._store.forEach((quad) => iteratee(quad, this));
  }

  async import(stream: RDF.Stream<RDF.Quad>): Promise<this> {
    await this._store.import(stream);
    return this;
  }

  intersection(other: QuadDataSet): N3StoreWrapper {
    return new N3StoreWrapper(this._store.intersection(other));
  }

  map(iteratee: (quad: RDF.Quad, dataset: this) => RDF.Quad): N3StoreWrapper {
    return new N3StoreWrapper(this._store.map((quad) => iteratee(quad, this)));
  }

  reduce<A>(
    iteratee: (accumulator: A, quad: RDF.Quad, dataset: this) => A,
    initialValue?: A | undefined,
  ): A {
    return this._store.reduce<A>(
      (acc, quad) => iteratee(acc, quad, this),
      initialValue,
    );
  }

  some(iteratee: (quad: RDF.Quad, dataset: this) => boolean): boolean {
    return this._store.some((quad) => iteratee(quad, this));
  }

  toArray(): RDF.Quad[] {
    return this._store.toArray();
  }

  toCanonical(): string {
    return this._store.toCanonical();
  }

  toStream(): RDF.Stream<RDF.Quad> {
    return this._store.toStream();
  }

  toString(): string {
    return this._store.toString();
  }

  union(quads: RDF.Dataset<RDF.Quad, RDF.Quad>): N3StoreWrapper {
    return new N3StoreWrapper(this._store.union(quads));
  }

  [Symbol.iterator](): Iterator<RDF.Quad> {
    return this._store[Symbol.iterator]();
  }
}
