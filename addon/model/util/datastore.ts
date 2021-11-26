import * as RDF from '@rdfjs/types';
import dataset, {FastDataset} from '@graphy/memory.dataset.fast';
import ModelRange, {RangeContextStrategy} from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import {ModelQuadSubject, RdfaParseConfig, RdfaParser} from "@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser";
import {
  ConBlankNode,
  ConciseTerm,
  conciseToRdfjs,
  ConLiteral,
  ConNamedNode,
  TermConverter
} from "@lblod/ember-rdfa-editor/model/util/concise-term-string";
import {defaultPrefixes} from "@lblod/ember-rdfa-editor/config/rdfa";

export type SubjectSpec = RDF.Quad_Subject | ConNamedNode | ConBlankNode | null;
export type PredicateSpec = RDF.Quad_Predicate | ConNamedNode | null;
export type ObjectSpec = RDF.Quad_Object | ConNamedNode | ConBlankNode | ConLiteral;
type Primitive = number | string | boolean;

interface TermNodesResponse {
  nodes: Set<ModelNode>
}

interface SubjectNodesResponse extends TermNodesResponse {
  subject: RDF.Quad_Subject,
}

interface PredicateNodesResponse extends TermNodesResponse {
  predicate: RDF.Quad_Predicate,
}

interface ObjectNodesResponse extends TermNodesResponse {
  object: RDF.Quad_Object,
}

function isPrimitive(thing: unknown): thing is Primitive {
  return typeof thing === "string" || typeof thing === "boolean" || typeof thing === "number";

}

export default interface Datastore {
  get dataset(): RDF.Dataset;

  get size(): number;

  limitToRange(range: ModelRange, strategy?: RangeContextStrategy): Datastore;

  match(subject?: SubjectSpec, predicate?: PredicateSpec, object?: ObjectSpec): Datastore;

  transformDataset(action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset): Datastore;

  asSubjectNodes(): Generator<SubjectNodesResponse>

  asPredicateNodes(): Generator<PredicateNodesResponse>

  asObjectNodes(): Generator<ObjectNodesResponse>

  asQuads(): Generator<RDF.Quad>
}


interface DatastoreConfig {
  dataset: RDF.Dataset;
  subjectToNodes: Map<string, Set<ModelNode>>;
  nodeToSubject: Map<ModelNode, ModelQuadSubject>;
  prefixMapping: Map<string, string>
}

export class EditorStore implements Datastore {

  private _dataset: RDF.Dataset;
  private _subjectToNodesMapping: Map<string, Set<ModelNode>>;
  private _nodeToSubjectMapping: Map<ModelNode, ModelQuadSubject>;
  private _prefixMapping: Map<string, string>;

  constructor({dataset, nodeToSubject, subjectToNodes, prefixMapping}: DatastoreConfig) {
    this._dataset = dataset;
    this._nodeToSubjectMapping = nodeToSubject;
    this._subjectToNodesMapping = subjectToNodes;
    this._prefixMapping = prefixMapping;
  }

  static fromParse(config: RdfaParseConfig): Datastore {
    const {dataset, subjectToNodesMapping, nodeToSubjectMapping} = RdfaParser.parse(config);
    const prefixMap = new Map<string, string>(Object.entries(defaultPrefixes));

    return new EditorStore({
      dataset,
      subjectToNodes: subjectToNodesMapping,
      nodeToSubject: nodeToSubjectMapping,
      prefixMapping: prefixMap
    });
  }

  get dataset(): RDF.Dataset {
    return this._dataset;
  }

  get size(): number {
    return this._dataset.size;
  }

  match(subject?: SubjectSpec, predicate?: PredicateSpec, object?: ObjectSpec): Datastore {
    const convertedSubject = typeof subject === "string" ? conciseToRdfjs(subject, this.getPrefix) : subject;
    const convertedPredicate = typeof predicate === "string" ? conciseToRdfjs(predicate, this.getPrefix) : predicate;
    const convertedObject = isPrimitive(object) ? conciseToRdfjs(object, this.getPrefix) : object;
    const newSet = this.dataset.match(convertedSubject, convertedPredicate, convertedObject, null);
    return this.fromDataset(newSet);
  }

  limitToRange(range: ModelRange, strategy: RangeContextStrategy): Datastore {
    const subjects = this.subjectsForRange(range, strategy);
    const subToNodesCopy = new Map(this._subjectToNodesMapping);
    const nodeToSubCopy = new Map(this._nodeToSubjectMapping);
    const newSet = this.dataset.filter((quad) => {
      if (subjects.has(quad.subject.value)) {
        return true;
      } else {
        const nodes = subToNodesCopy.get(quad.subject.value);
        if (nodes) {
          for (const node of nodes) {
            nodeToSubCopy.delete(node);
          }
          subToNodesCopy.delete(quad.subject.value);
        }
        return false;
      }
    });
    return new EditorStore({
      dataset: newSet,
      subjectToNodes: subToNodesCopy,
      nodeToSubject: nodeToSubCopy,
      prefixMapping: this._prefixMapping
    });
  }

  * asSubjectNodes(): Generator<SubjectNodesResponse> {
    const seenSubjects = new Set<string>();
    for (const quad of this.dataset) {
      if (!seenSubjects.has(quad.subject.value)) {
        const nodes = this._subjectToNodesMapping.get(quad.subject.value);
        if (nodes) {
          yield {subject: quad.subject, nodes};
        }
      }
    }
  }

  asPredicateNodes(): Generator<PredicateNodesResponse> {
    throw new Error('Method not implemented.');
  }

  asObjectNodes(): Generator<ObjectNodesResponse> {
    throw new Error('Method not implemented.');
  }

  * asQuads(): Generator<RDF.Quad> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  transformDataset(action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset): Datastore {
    return this.fromDataset(action(this.dataset, (term: ConciseTerm) => conciseToRdfjs(term, this.getPrefix)));
  }

  private fromDataset(dataset: RDF.Dataset): Datastore {
    return new EditorStore({
      dataset,
      nodeToSubject: this._nodeToSubjectMapping,
      subjectToNodes: this._subjectToNodesMapping,
      prefixMapping: this._prefixMapping
    });
  }

  private subjectsForRange(range: ModelRange, strategy: RangeContextStrategy): Set<string> {
    const subjects = new Set<string>();
    for (const node of range.contextNodes(strategy)) {
      const subject = this._nodeToSubjectMapping.get(node);
      if (subject) {
        subjects.add(subject.value);
      }
    }
    return subjects;
  }

  private getPrefix = (prefix: string): string | null => {
    return this._prefixMapping.get(prefix) || null;
  };


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

  import(_stream: RDF.Stream<RDF.Quad>): Promise<this> {
    throw new NotImplementedError();
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
    throw new NotImplementedError();
  }

  toStream(): RDF.Stream<RDF.Quad> {
    throw new NotImplementedError();
  }

  toString(): string {
    throw new NotImplementedError();
  }

  union(quads: RDF.Dataset<RDF.Quad, RDF.Quad>): RDF.Dataset<RDF.Quad, RDF.Quad> {
    const gds = new GraphyDataset(quads);
    return new GraphyDataset(this.fastDataset.union(gds.fastDataset));
  }

  [Symbol.iterator](): Iterator<RDF.Quad> {
    return this.fastDataset[Symbol.iterator]();
  }


}

