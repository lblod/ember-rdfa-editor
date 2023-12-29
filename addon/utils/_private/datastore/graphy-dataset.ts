import * as RDF from '@rdfjs/types';
import dataset, { FastDataset } from '@graphy/memory.dataset.fast';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

function isFastDataset(thing: unknown): thing is FastDataset {
  // ts fails us here, see https://github.com/Microsoft/TypeScript/issues/21732
  if (thing && 'isGraphyFastDataset' in (thing as Record<string, unknown>)) {
    return (thing as FastDataset).isGraphyFastDataset;
  }
  return false;
}

function isGraphyDataset(thing: unknown): thing is GraphyDataset {
  return thing instanceof GraphyDataset;
}

type QuadDataSet = RDF.Dataset<RDF.Quad, RDF.Quad>;

/**
 * Spec-compliant wrapper for graphy
 */
export class GraphyDataset implements QuadDataSet {
  private _fastDataset: FastDataset;

  constructor(quads?: RDF.Dataset | RDF.Quad[] | FastDataset | GraphyDataset) {
    if (isFastDataset(quads)) {
      this._fastDataset = quads;
    } else if (isGraphyDataset(quads)) {
      this._fastDataset = quads.fastDataset;
    } else {
      this._fastDataset = dataset();
      if (quads) {
        this._fastDataset.addAll(quads);
      }
    }
  }

  get size(): number {
    return this.fastDataset.size;
  }

  get fastDataset(): FastDataset {
    return this._fastDataset;
  }

  add(quad: RDF.Quad): this {
    this.fastDataset.add(quad);
    return this;
  }

  delete(quad: RDF.Quad): this {
    this.fastDataset.delete(quad);
    return this;
  }

  has(quad: RDF.Quad): boolean {
    return this.fastDataset.has(quad);
  }

  match(
    subject?: RDF.Quad_Subject | null,
    predicate?: RDF.Quad_Predicate | null,
    object?: RDF.Quad_Object | null,
    graph?: RDF.Quad_Graph | null,
  ): QuadDataSet {
    return new GraphyDataset(
      this.fastDataset.match(subject, predicate, object, graph),
    );
  }

  addAll(quads: QuadDataSet | RDF.Quad[]): this {
    this._fastDataset.addAll(quads);
    return this;
  }

  contains(other: QuadDataSet): boolean {
    return this.intersection(other).size === other.size;
  }

  deleteMatches(
    subject?: RDF.Quad_Subject,
    predicate?: RDF.Quad_Predicate,
    object?: RDF.Quad_Object,
    graph?: RDF.Quad_Graph,
  ): this {
    const matches = new GraphyDataset(
      this.match(subject, predicate, object, graph),
    );
    this._fastDataset = this.fastDataset.difference(matches.fastDataset);

    return this;
  }

  difference(other: QuadDataSet): QuadDataSet {
    const gds = new GraphyDataset(other);
    return new GraphyDataset(this.fastDataset.difference(gds.fastDataset));
  }

  minus(other: QuadDataSet): QuadDataSet {
    const gds = new GraphyDataset(other);
    return new GraphyDataset(this.fastDataset.minus(gds.fastDataset));
  }

  equals(other: RDF.Dataset<RDF.Quad, RDF.Quad>): boolean {
    const gds = new GraphyDataset(other);
    return this.fastDataset.equals(gds.fastDataset);
  }

  every(iteratee: (quad: RDF.Quad, dataset: this) => boolean): boolean {
    for (const quad of this) {
      if (!iteratee(quad, this)) {
        return false;
      }
    }
    return true;
  }

  filter(
    iteratee: (quad: RDF.Quad, dataset: this) => boolean,
  ): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const rslt = [];
    for (const quad of this) {
      if (iteratee(quad, this)) {
        rslt.push(quad);
      }
    }
    return new GraphyDataset(rslt);
  }

  forEach(iteratee: (quad: RDF.Quad, dataset: this) => void): void {
    for (const quad of this) {
      iteratee(quad, this);
    }
  }

  import(_stream: RDF.Stream<RDF.Quad>): Promise<this> {
    throw new NotImplementedError();
  }

  intersection(other: QuadDataSet): QuadDataSet {
    const gds = new GraphyDataset(other);
    return new GraphyDataset(this.fastDataset.intersection(gds.fastDataset));
  }

  map(
    iteratee: (
      quad: RDF.Quad,
      dataset: RDF.Dataset<RDF.Quad, RDF.Quad>,
    ) => RDF.Quad,
  ): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const result = [];
    for (const quad of this) {
      result.push(iteratee(quad, this));
    }
    return new GraphyDataset(result);
  }

  reduce<A>(
    iteratee: (accumulator: A, quad: RDF.Quad, dataset: this) => A,
    initialValue: A | RDF.Quad | null = this[Symbol.iterator]().next()
      .value as RDF.Quad | null,
  ): A {
    let accumulator = initialValue;
    // some bad typing in the spec causes these ugly casts
    for (const quad of this) {
      accumulator = iteratee(accumulator as A, quad, this);
    }

    return accumulator as A;
  }

  some(iteratee: (quad: RDF.Quad, dataset: this) => boolean): boolean {
    for (const quad of this) {
      if (iteratee(quad, this)) {
        return true;
      }
    }
    return false;
  }

  toArray(): RDF.Quad[] {
    return [...this];
  }

  toCanonical(): string {
    throw new NotImplementedError();
  }

  toStream(): RDF.Stream<RDF.Quad> {
    throw new NotImplementedError();
  }

  toString(): string {
    throw new NotImplementedError();
  }

  union(
    quads: RDF.Dataset<RDF.Quad, RDF.Quad>,
  ): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const gds = new GraphyDataset(quads);
    return new GraphyDataset(this.fastDataset.union(gds.fastDataset));
  }

  [Symbol.iterator](): Iterator<RDF.Quad> {
    return this.fastDataset[Symbol.iterator]();
  }
}
