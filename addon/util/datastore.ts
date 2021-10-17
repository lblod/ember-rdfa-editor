import {
  BlankNode,
  Dataset,
  DatasetFactory,
  DefaultGraph,
  GraphTerm,
  Literal,
  NamedNode,
  ObjectTerm,
  PredicateTerm,
  Quad,
  QuadFilterIteratee,
  QuadMapIteratee,
  QuadReduceIteratee,
  QuadRunIteratee,
  Stream,
  SubjectTerm,
  Term,
  Variable
} from "rdfjs";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import dataset, {FastDataset} from "@graphy/memory.dataset.fast";

function isFastDataset(thing: any): thing is FastDataset {
  if (!thing) {
    return false;
  }
  if ("isGraphyFastDataset" in thing) {
    return thing.isGraphyFastDataset;
  }
  return false;
}

export default class Datastore implements Dataset, DatasetFactory {
  private _fastDataset: FastDataset;

  constructor(quads?: Dataset | Quad[] | FastDataset) {
    if (isFastDataset(quads)) {
      this._fastDataset = quads;
    }
    this._fastDataset = dataset(quads);
  }

  get size() {
    return this._fastDataset.size;
  }

  get fastDataset(): FastDataset {
    return this._fastDataset;
  }

  fromFastDataset(fastDataset: FastDataset): Datastore {
    return new Datastore(fastDataset);

  }

  dataset(quads?: Dataset | Quad[] | FastDataset): Datastore {
    return new Datastore(quads);
  }

  [Symbol.iterator](): Iterator<Quad> {
    return this._fastDataset[Symbol.iterator]();
  }

  get [Symbol("key-count")]() {
    return this._fastDataset.size;
  }

  add(quad: Quad): Datastore {
    this._fastDataset.add(quad);
    return this;
  }

  addAll(quads: Dataset | Quad[]): Datastore {
    this._fastDataset.addAll(quads);
    return this;
  }

  blankNode(value?: string): BlankNode {
    throw new NotImplementedError();
  }

  contains(other: Dataset): boolean {
    return this._fastDataset.intersection(other).size === other.size;
  }


  defaultGraph(): DefaultGraph {
    throw new NotImplementedError();
  }

  delete(quad: Quad): Datastore {
    this._fastDataset.delete(quad);
    return this;
  }

  deleteMatches(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Dataset {
    throw new NotImplementedError();
  }

  difference(other: Dataset): Dataset {
    return this.fromFastDataset(this._fastDataset.difference(other));
  }

  equals(other: Dataset): boolean {
    return this._fastDataset.equals(other);
  }

  every(iteratee: QuadFilterIteratee | ((quad: Quad, dataset: Dataset) => boolean)): boolean {
    let test;
    if (iteratee instanceof Function) {
      test = iteratee;
    } else {
      test = iteratee.test;
    }
    for (const quad of this) {
      if (!test(quad, this)) {
        return false;
      }
    }
    return true;
  }

  filter(iteratee: QuadFilterIteratee): Dataset {
    throw new NotImplementedError();
  }

  forEach(iteratee: QuadRunIteratee): void {
    throw new NotImplementedError();
  }

  fromQuad(original: Quad): Quad {
    throw new NotImplementedError();
  }

  fromTerm<T extends Term>(original: T): T {
    throw new NotImplementedError();
  }

  has(quad: Quad): boolean {
    return this._fastDataset.has(quad);
  }

  import(stream: Stream<Quad>): Promise<Dataset> {
    throw new NotImplementedError();
  }

  intersection(other: Datastore): Datastore {
    return this.fromFastDataset(this._fastDataset.intersection(other.fastDataset));
  }

  literal(value: string, languageOrDatatype?: string | NamedNode): Literal {
    throw new NotImplementedError();
  }

  map(iteratee: QuadMapIteratee): Dataset {
    throw new NotImplementedError();
  }

  match(subject?: SubjectTerm, predicate?: PredicateTerm, object?: ObjectTerm, graph?: GraphTerm): Dataset {
    return this.fromFastDataset(this._fastDataset.match(subject, predicate, object, graph));
  }

  namedNode(value: string): NamedNode {
    throw new NotImplementedError();
  }

  quad(subject: SubjectTerm, predicate: PredicateTerm, object: ObjectTerm, graph?: GraphTerm): Quad {
    throw new NotImplementedError();
  }

  reduce(iteratee: QuadReduceIteratee, initialValue?: unknown): unknown {
    throw new NotImplementedError();
  }

  some(iteratee: QuadFilterIteratee | ((quad: Quad, dataset: Dataset) => boolean)): boolean {
    let test;
    if (iteratee instanceof Function) {
      test = iteratee;
    } else {
      test = iteratee.test;
    }
    for (const quad of this) {
      if (test(quad, this)) {
        return true;
      }
    }
    return false;
  }

  toCanonical(): string {
    throw new NotImplementedError();
  }

  toStream(): Stream<Quad> {
    throw new NotImplementedError();
  }

  union(quads: Dataset): Dataset {
    return this.fromFastDataset(this._fastDataset.union(quads));
  }

  variable(value: string): Variable {
    throw new NotImplementedError();
  }
}
