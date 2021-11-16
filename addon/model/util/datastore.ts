import * as RDF from '@rdfjs/types';
import dataset, {FastDataset} from '@graphy/memory.dataset.fast';
import ModelRange, {RangeContextStrategy} from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

interface TripleQuery {
  subject?: RDF.Quad_Subject,
  predicate?: RDF.Quad_Predicate,
  object?: RDF.Quad_Object
}

export interface Triple {
  subject: RDF.Quad_Subject;
  predicate: RDF.Quad_Predicate;
  object: RDF.Quad_Object;
}

export default interface Datastore {
  dataForRange(range: ModelRange, strategy: RangeContextStrategy): RDF.Dataset;
}

export class EditorStore implements Datastore {
  private dataSet: FastDataset = dataset();
  private nodeToSubject = new WeakMap<ModelNode, RDF.Quad_Subject>();
  private subjectToNodes = new Map<RDF.Quad_Subject, ModelNode[]>();

  getSubjectRanges(subject: RDF.Quad_Subject): ModelRange[] {
    const nodes = this.getSubjectNodes(subject);
    if (nodes) {
      //TODO: merge these ranges if they overlap
      return nodes.map(node => this.getRangeOfSubjectNode(node));
    } else {
      return [];
    }
  }

  getSubjectNodes(subject: RDF.Quad_Subject): ModelNode[] | undefined {
    return this.subjectToNodes.get(subject);
  }

  getRangeOfSubjectNode(node: ModelNode): ModelRange {
    return ModelRange.fromAroundNode(node);
  }

  * findTriples(query: TripleQuery): Generator<Triple> {
    const {subject, predicate, object} = query;
    const triples = this.dataSet.match(subject, predicate, object);
    for (const triple of triples) {
      yield triple;
    }
  }


  * findTriplesForRange(range: ModelRange, query: TripleQuery, strategy: RangeContextStrategy): Generator<RDF.Quad> {
    return undefined;
  }

}

function isFastDataset(thing: unknown): thing is FastDataset {
  // ts fails us here, see https://github.com/Microsoft/TypeScript/issues/21732
  if (thing && "isGraphyFastDataset" in (thing as Record<string, unknown>)) {
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

  match(subject?: RDF.Quad_Subject | null, predicate?: RDF.Quad_Predicate | null, object?: RDF.Quad_Object | null, graph?: RDF.Quad_Graph | null): QuadDataSet {
    return new GraphyDataset(this.fastDataset.match(subject, predicate, object, graph));
  }


  addAll(quads: QuadDataSet | RDF.Quad[]): this {
    this._fastDataset.addAll(quads);
    return this;
  }

  contains(other: QuadDataSet): boolean {
    return this.intersection(other).size === other.size;
  }

  deleteMatches(subject?: RDF.Quad_Subject, predicate?: RDF.Quad_Predicate, object?: RDF.Quad_Object, graph?: RDF.Quad_Graph): this {
    const matches = this.match(subject, predicate, object, graph);
    const quads: RDF.Quad[] = [...matches];
    this.fastDataset.deleteQuads(quads);
    return this;
  }

  difference(other: QuadDataSet): QuadDataSet {
    const gds = new GraphyDataset(other);
    return new GraphyDataset(this.fastDataset.difference(gds.fastDataset));
  }

  equals(other: RDF.Dataset<RDF.Quad, RDF.Quad>): boolean {
    const gds = new GraphyDataset(other);
    return this.fastDataset.equals(gds.fastDataset);
  }

  every(iteratee: (quad: RDF.Quad, dataset: RDF.Dataset<RDF.Quad, RDF.Quad>) => boolean): boolean {
    for (const quad of this) {
      if (!iteratee(quad, this)) {
        return false;
      }
    }
    return true;
  }

  filter(iteratee: (quad: RDF.Quad, dataset: RDF.Dataset<RDF.Quad, RDF.Quad>) => boolean): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const rslt = [];
    for (const quad of this) {
      if (iteratee(quad, this)) {
        rslt.push(quad);
      }
    }
    return new GraphyDataset(rslt);
  }

  forEach(iteratee: (quad: RDF.Quad, dataset: RDF.Dataset<RDF.Quad, RDF.Quad>) => void): void {
    for (const quad of this) {
      iteratee(quad, this);
    }
  }

  import(stream: RDF.Stream<RDF.Quad>): Promise<this> {
    throw new Error('Method not implemented.');
  }

  intersection(other: QuadDataSet): QuadDataSet {
    const gds = new GraphyDataset(other);
    return new GraphyDataset(this.fastDataset.intersection(gds.fastDataset));
  }

  map(iteratee: (quad: RDF.Quad, dataset: RDF.Dataset<RDF.Quad, RDF.Quad>) => RDF.Quad): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const result = [];
    for (const quad of this) {
      result.push(iteratee(quad, this));
    }
    return new GraphyDataset(result);
  }

  reduce<A>(iteratee: (accumulator: A, quad: RDF.Quad, dataset: QuadDataSet) => A, initialValue?: A): A {
    const firstQuad = this[Symbol.iterator]().next().value as RDF.Quad | null;
    let accumulator = initialValue || firstQuad;
    // some bad typing in the spec causes these ugly casts
    for (const quad of this) {
      accumulator = iteratee(accumulator as A, quad, this);
    }

    return accumulator as A;

  }

  some(iteratee: (quad: RDF.Quad, dataset: RDF.Dataset<RDF.Quad, RDF.Quad>) => boolean): boolean {
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
    throw new Error('Method not implemented.');
  }

  toStream(): RDF.Stream<RDF.Quad> {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    throw new Error('Method not implemented.');
  }

  union(quads: RDF.Dataset<RDF.Quad, RDF.Quad>): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const gds = new GraphyDataset(quads);
    return new GraphyDataset(this.fastDataset.union(gds.fastDataset));
  }

  [Symbol.iterator](): Iterator<RDF.Quad> {
    return this.fastDataset[Symbol.iterator]();
  }


}

