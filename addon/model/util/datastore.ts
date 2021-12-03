import * as RDF from '@rdfjs/types';
import dataset, {FastDataset} from '@graphy/memory.dataset.fast';
import ModelRange, {RangeContextStrategy} from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import {
  ModelQuadObject,
  ModelQuadPredicate,
  ModelQuadSubject,
  RdfaParseConfig,
  RdfaParser
} from "@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser";
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

  get termConverter(): TermConverter;

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

  predicateToNodes: Map<string, Set<ModelNode>>;
  nodeToPredicates: Map<ModelNode, Set<ModelQuadPredicate>>;

  objectToNodes: Map<string, Set<ModelNode>>;
  nodeToObjects: Map<ModelNode, Set<ModelQuadObject>>;
  prefixMapping: Map<string, string>
}

export class EditorStore implements Datastore {

  private _dataset: RDF.Dataset;
  private _subjectToNodes: Map<string, Set<ModelNode>>;
  private _nodeToSubject: Map<ModelNode, ModelQuadSubject>;
  private _prefixMapping: Map<string, string>;
  private _nodeToPredicates: Map<ModelNode, Set<ModelQuadPredicate>>;
  private _predicateToNodes: Map<string, Set<ModelNode>>;
  private _nodeToObjects: Map<ModelNode, Set<ModelQuadObject>>;
  private _objectToNodes: Map<string, Set<ModelNode>>;

  constructor({
                dataset,
                nodeToSubject,
                subjectToNodes,
                prefixMapping,
                nodeToPredicates,
                predicateToNodes,
                nodeToObjects,
                objectToNodes
              }: DatastoreConfig) {
    this._dataset = dataset;
    this._nodeToSubject = nodeToSubject;
    this._subjectToNodes = subjectToNodes;
    this._prefixMapping = prefixMapping;
    this._nodeToPredicates = nodeToPredicates;
    this._predicateToNodes = predicateToNodes;
    this._nodeToObjects = nodeToObjects;
    this._objectToNodes = objectToNodes;
  }

  static fromParse(config: RdfaParseConfig): Datastore {
    const {
      dataset,
      subjectToNodesMapping,
      nodeToSubjectMapping,
      objectToNodesMapping,
      nodeToObjectsMapping,
      predicateToNodesMapping,
      nodeToPredicatesMapping
    } = RdfaParser.parse(config);
    const prefixMap = new Map<string, string>(Object.entries(defaultPrefixes));

    return new EditorStore({
      dataset,
      subjectToNodes: subjectToNodesMapping,
      nodeToSubject: nodeToSubjectMapping,
      prefixMapping: prefixMap,
      objectToNodes: objectToNodesMapping,
      nodeToObjects: nodeToObjectsMapping,
      predicateToNodes: predicateToNodesMapping,
      nodeToPredicates: nodeToPredicatesMapping
    });
  }

  get dataset(): RDF.Dataset {
    return this._dataset;
  }

  get size(): number {
    return this._dataset.size;
  }
  termConverter = (term: ConciseTerm) => conciseToRdfjs(term, this.getPrefix);

  match(subject?: SubjectSpec, predicate?: PredicateSpec, object?: ObjectSpec): Datastore {
    const convertedSubject = typeof subject === "string" ? conciseToRdfjs(subject, this.getPrefix) : subject;
    const convertedPredicate = typeof predicate === "string" ? conciseToRdfjs(predicate, this.getPrefix) : predicate;
    const convertedObject = isPrimitive(object) ? conciseToRdfjs(object, this.getPrefix) : object;
    const newSet = this.dataset.match(convertedSubject, convertedPredicate, convertedObject, null);
    return this.fromDataset(newSet);
  }

  limitToRange(range: ModelRange, strategy: RangeContextStrategy): Datastore {
    const subjects = this.subjectsForRange(range, strategy);
    const subToNodesCopy = new Map(this._subjectToNodes);
    const nodeToSubCopy = new Map(this._nodeToSubject);
    const predToNodesCopy = new Map(this._predicateToNodes);
    const nodeToPredsCopy = new Map(this._nodeToPredicates);
    const objToNodesCopy = new Map(this._objectToNodes);
    const nodeToObjCopy = new Map(this._nodeToObjects);
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
      predicateToNodes: predToNodesCopy,
      nodeToPredicates: nodeToPredsCopy,
      objectToNodes: objToNodesCopy,
      nodeToObjects: nodeToObjCopy,
      prefixMapping: this._prefixMapping
    });
  }

  * asSubjectNodes(): Generator<SubjectNodesResponse> {
    const seenSubjects = new Set<string>();
    for (const quad of this.dataset) {
      if (!seenSubjects.has(quad.subject.value)) {
        const nodes = this._subjectToNodes.get(quad.subject.value);
        if (nodes) {
          yield {subject: quad.subject, nodes};
        }
        seenSubjects.add(quad.subject.value);
      }
    }
  }

  * asPredicateNodes(): Generator<PredicateNodesResponse> {
    const seenPredicates = new Map<string, RDF.Quad_Predicate>();
    const seenSubjects = new Set<string>();

    // collect all unique predicates and subjects in the current dataset
    for (const quad of this.dataset) {
      seenSubjects.add(quad.subject.value);
      seenPredicates.set(quad.predicate.value, quad.predicate);
    }

    for (const pred of seenPredicates.keys()) {
      const allNodes = this._predicateToNodes.get(pred);
      if (allNodes) {
        const nodes = new Set<ModelNode>();
        // we have to filter out nodes that belong to a subject which is not in the dataset
        for (const node of allNodes) {
          const nodeSubject = this._nodeToSubject.get(node);
          if (nodeSubject && seenSubjects.has(nodeSubject.value)) {
            nodes.add(node);
          }
        }
        yield {predicate: seenPredicates.get(pred)!, nodes};
      }
    }
  }

  * asObjectNodes(): Generator<ObjectNodesResponse> {
    const seenObjects = new Set<string>();
    for (const quad of this.dataset) {
      if (!seenObjects.has(quad.object.value)) {
        const nodes = this._objectToNodes.get(quad.object.value);
        if (nodes) {
          yield {object: quad.object, nodes};
        }
        seenObjects.add(quad.object.value);
      }
    }
  }

  * asQuads(): Generator<RDF.Quad> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  transformDataset(action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset): Datastore {
    return this.fromDataset(action(this.dataset, this.termConverter));
  }

  private fromDataset(dataset: RDF.Dataset): Datastore {
    return new EditorStore({
      dataset,
      nodeToSubject: this._nodeToSubject,
      subjectToNodes: this._subjectToNodes,
      predicateToNodes: this._predicateToNodes,
      nodeToPredicates: this._nodeToPredicates,
      nodeToObjects: this._nodeToObjects,
      objectToNodes: this._objectToNodes,
      prefixMapping: this._prefixMapping
    });
  }

  private subjectsForRange(range: ModelRange, strategy: RangeContextStrategy): Set<string> {
    const subjects = new Set<string>();
    for (const node of range.contextNodes(strategy)) {
      const subject = this._nodeToSubject.get(node);
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

