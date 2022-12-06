import * as RDF from '@rdfjs/types';
import {
  ModelQuadObject,
  ModelQuadPredicate,
  ModelQuadSubject,
  quadHash,
  QuadNodes,
  RdfaParseConfig,
  RdfaParser,
} from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import {
  ConciseTerm,
  conciseToRdfjs,
  TermConverter,
} from '@lblod/ember-rdfa-editor/utils/concise-term-string';
import { defaultPrefixes } from '@lblod/ember-rdfa-editor/config/rdfa';
import { ResultSet } from '@lblod/ember-rdfa-editor/utils/datastore/result-set';
import { TermMapping } from '@lblod/ember-rdfa-editor/utils/datastore/term-mapping';
import {
  isPrimitive,
  ObjectSpec,
  PredicateSpec,
  SubjectSpec,
} from '@lblod/ember-rdfa-editor/utils/datastore/term-spec';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import { GraphyDataset } from './graphy-dataset';
import { Node as PNode } from 'prosemirror-model';
import SetUtils from '@lblod/ember-rdfa-editor/utils/set-utils';
import { EditorState } from 'prosemirror-state';
import { ResolvedPos } from 'prosemirror-model';

export type ResolvedPNode = {
  node: PNode;
  pos?: ResolvedPos;
};

interface TermNodesResponse<N> {
  nodes: Set<N>;
}

interface SubjectNodesResponse<N> extends TermNodesResponse<N> {
  subject: RDF.Quad_Subject;
}

interface PredicateNodesResponse<N> extends TermNodesResponse<N> {
  predicate: RDF.Quad_Predicate;
}

interface ObjectNodesResponse<N> extends TermNodesResponse<N> {
  object: RDF.Quad_Object;
}

export type WhichTerm = 'subject' | 'predicate' | 'object';

/**
 * High-level interface to query RDF-knowledge from the document.
 * Designed with the principles of a fluent interface in mind.
 *
 * There are two method types: transformers and consumers.
 * Transformers operate on the underlying knowledge (e.g. filtering triples)
 * and always return a datastore, allowing easy method chaining.
 *
 * Consumers are methods that return anything other than a datastore, typically
 * representing the transformed knowledge in some convenient format.
 */
export default interface Datastore<N> {
  get dataset(): RDF.Dataset;

  get size(): number;

  /**
   * The function used to convert concise term syntax (see {@link ConciseTerm})
   * into RDFjs term objects
   */
  get termConverter(): TermConverter;

  /**
   * Transformer method.
   * Filters out any triples which do not match the given pattern.
   * Pattern matching behaves similar as in SPARQL (but don't stretch that metaphor too far).
   *
   * Passing in undefined for any of the arguments means any term will match it.
   *
   * This method accepts concise term syntax, as defined in {@link ConciseTerm}
   *
   * @param subject
   * @param predicate
   * @param object
   */
  match(
    subject?: SubjectSpec,
    predicate?: PredicateSpec,
    object?: ObjectSpec
  ): this;

  /**
   * Transformer method.
   * Low-level escape hatch.
   * Pass in a callback which will receive the underlying RDFjs-compliant {@link RDF.Dataset}
   * and a termconverter function to convert concise term syntax (see {@link ConciseTerm})
   * into RDFjs Term objects.
   * @param action
   */
  transformDataset(
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset
  ): this;

  /** Transformer method.
   * Allows specifying of custom prefixes for use in the {@link match} method
   * and the termConverter in the {@link transformDataset} method,
   * or overwrite the ones that were scanned from the document.
   *
   * Reminder: only has an effect on the convenience "concise term syntax".
   * Has no effect on the actual rdfa parsing.
   */
  withExtraPrefixes(prefixes: Record<string, string>): this;

  /**
   * Consumer method.
   * Returns a {@link TermMapping} of the currently valid subjects and the nodes that define them.
   */
  asSubjectNodeMapping(): TermMapping<RDF.Quad_Subject, N>;

  /**
   * Consumer method.
   * Returns a {@link TermMapping} of the currently valid predicates and the nodes that define them.
   */
  asPredicateNodeMapping(): TermMapping<RDF.Quad_Predicate, N>;

  /**
   * Consumer method.
   * Returns a {@link TermMapping} of the currently valid objects and the nodes that define them.
   */
  asObjectNodeMapping(): TermMapping<RDF.Quad_Object, N>;

  /**
   * Consumer method.
   * Returns a {@link ResultSet} of all currently valid quads.
   */
  asQuadResultSet(): ResultSet<RDF.Quad>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of mappings between subjects and their nodes.
   * No order is implied.
   */
  asSubjectNodes(): Generator<SubjectNodesResponse<N>>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of mappings between predicates and their nodes.
   * No order is implied.
   */
  asPredicateNodes(): Generator<PredicateNodesResponse<N>>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of mappings between objects and their nodes.
   * No order is implied.
   */
  asObjectNodes(): Generator<ObjectNodesResponse<N>>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of current relevant quads
   */
  asQuads(): Generator<RDF.Quad>;
}

interface DatastoreConfig<N> {
  documentRoot: N;
  dataset: RDF.Dataset;
  subjectToNodes: Map<string, N[]>;
  nodeToSubject: Map<N, ModelQuadSubject<N>>;

  predicateToNodes: Map<string, N[]>;
  nodeToPredicates: Map<N, Set<ModelQuadPredicate<N>>>;

  objectToNodes: Map<string, N[]>;
  nodeToObjects: Map<N, Set<ModelQuadObject<N>>>;
  quadToNodes: Map<string, QuadNodes<N>>;
  prefixMapping: Map<string, string>;
}

interface GenericDatastoreConfig<N> extends DatastoreConfig<N> {
  getParent: (node: N, root: N) => N | null;
}

export class EditorStore<N> implements Datastore<N> {
  protected _documentRoot: N;
  protected _dataset: RDF.Dataset;
  protected _subjectToNodes: Map<string, N[]>;
  protected _nodeToSubject: Map<N, ModelQuadSubject<N>>;
  protected _prefixMapping: Map<string, string>;
  protected _nodeToPredicates: Map<N, Set<ModelQuadPredicate<N>>>;
  protected _predicateToNodes: Map<string, N[]>;
  protected _nodeToObjects: Map<N, Set<ModelQuadObject<N>>>;
  protected _objectToNodes: Map<string, N[]>;
  protected _quadToNodes: Map<string, QuadNodes<N>>;
  protected _getParent: (node: N, root: N) => N | null;

  constructor({
    documentRoot,
    dataset,
    nodeToSubject,
    subjectToNodes,
    prefixMapping,
    nodeToPredicates,
    predicateToNodes,
    nodeToObjects,
    objectToNodes,
    quadToNodes,
    getParent,
  }: GenericDatastoreConfig<N>) {
    this._documentRoot = documentRoot;
    this._dataset = dataset;
    this._nodeToSubject = nodeToSubject;
    this._subjectToNodes = subjectToNodes;
    this._prefixMapping = prefixMapping;
    this._nodeToPredicates = nodeToPredicates;
    this._predicateToNodes = predicateToNodes;
    this._nodeToObjects = nodeToObjects;
    this._objectToNodes = objectToNodes;
    this._quadToNodes = quadToNodes;
    this._getParent = getParent;
  }

  static empty<N>(
    documentRoot: N,
    getParent: (node: N) => N | null
  ): Datastore<N> {
    const subjectToNodes = new Map<string, N[]>();
    const nodeToSubject = new Map<N, ModelQuadSubject<N>>();
    const prefixMapping = new Map<string, string>();
    const nodeToPredicates = new Map<N, Set<ModelQuadPredicate<N>>>();
    const predicateToNodes = new Map<string, N[]>();
    const nodeToObjects = new Map<N, Set<ModelQuadObject<N>>>();
    const objectToNodes = new Map<string, N[]>();
    const quadToNodes = new Map<string, QuadNodes<N>>();
    return new EditorStore({
      documentRoot,
      dataset: new GraphyDataset(),
      subjectToNodes,
      nodeToObjects,
      prefixMapping,
      nodeToPredicates,
      nodeToSubject,
      quadToNodes,
      objectToNodes,
      predicateToNodes,
      getParent,
    });
  }

  static fromParse<N>(config: RdfaParseConfig<N>): Datastore<N> {
    const {
      dataset,
      subjectToNodesMapping,
      nodeToSubjectMapping,
      objectToNodesMapping,
      nodeToObjectsMapping,
      predicateToNodesMapping,
      nodeToPredicatesMapping,
      quadToNodesMapping,
      seenPrefixes,
    } = RdfaParser.parse(config);
    const prefixMap = new Map<string, string>(Object.entries(defaultPrefixes));
    for (const [key, value] of seenPrefixes.entries()) {
      prefixMap.set(key, value);
    }

    return new EditorStore<N>({
      documentRoot: config.root,
      dataset,
      subjectToNodes: subjectToNodesMapping,
      nodeToSubject: nodeToSubjectMapping,
      prefixMapping: prefixMap,
      objectToNodes: objectToNodesMapping,
      nodeToObjects: nodeToObjectsMapping,
      predicateToNodes: predicateToNodesMapping,
      nodeToPredicates: nodeToPredicatesMapping,
      quadToNodes: quadToNodesMapping,
      getParent: config.getParent,
    });
  }

  get dataset(): RDF.Dataset {
    return this._dataset;
  }

  get size(): number {
    return this._dataset.size;
  }

  termConverter = (term: ConciseTerm) => conciseToRdfjs(term, this.getPrefix);

  match(
    subject?: SubjectSpec,
    predicate?: PredicateSpec,
    object?: ObjectSpec
  ): this {
    const convertedSubject =
      typeof subject === 'string'
        ? conciseToRdfjs(subject, this.getPrefix)
        : subject;
    const convertedPredicate =
      typeof predicate === 'string'
        ? conciseToRdfjs(predicate, this.getPrefix)
        : predicate;
    const convertedObject = isPrimitive(object)
      ? conciseToRdfjs(object, this.getPrefix)
      : object;
    const newSet = this.dataset.match(
      convertedSubject,
      convertedPredicate,
      convertedObject,
      null
    );
    return this.fromDataset(this._documentRoot, newSet);
  }

  withExtraPrefixes(prefixes: Record<string, string>): this {
    for (const [key, value] of Object.entries(prefixes)) {
      this._prefixMapping.set(key, value);
    }
    return this;
  }

  asSubjectNodeMapping(): TermMapping<RDF.Quad_Subject, N> {
    return new TermMapping<RDF.Quad_Subject, N>(
      this.subjectNodeGenerator(),
      this.getPrefix
    );
  }

  private subjectNodeGenerator(): Map<RDF.Quad_Subject, N[]> {
    const seenSubjects = new Set<string>();
    const rslt = new Map<RDF.Quad_Subject, N[]>();
    for (const quad of this.dataset) {
      if (!seenSubjects.has(quad.subject.value)) {
        const nodes = this._subjectToNodes.get(quad.subject.value);
        if (nodes) {
          rslt.set(quad.subject, nodes);
        }
        seenSubjects.add(quad.subject.value);
      }
    }
    return rslt;
  }

  asPredicateNodeMapping(): TermMapping<RDF.Quad_Predicate, N> {
    return new TermMapping<RDF.Quad_Predicate, N>(
      this.predicateNodeGenerator(),
      this.getPrefix
    );
  }

  private predicateNodeGenerator(): Map<RDF.Quad_Predicate, N[]> {
    const seenPredicates = new Map<string, RDF.Quad_Predicate>();
    const seenSubjects = new Set<string>();
    const rslt = new Map<RDF.Quad_Predicate, N[]>();

    // collect all unique predicates and subjects in the current dataset
    for (const quad of this.dataset) {
      seenSubjects.add(quad.subject.value);
      seenPredicates.set(quad.predicate.value, quad.predicate);
    }

    for (const pred of seenPredicates.keys()) {
      const allNodes = this._predicateToNodes.get(pred);
      if (allNodes) {
        const nodes = [];
        // we have to filter out nodes that belong to a subject which is not in the dataset
        for (const node of allNodes) {
          const nodeSubject = this.getSubjectForNode(node);
          if (nodeSubject && seenSubjects.has(nodeSubject.value)) {
            nodes.push(node);
          }
        }
        rslt.set(seenPredicates.get(pred)!, nodes);
      }
    }
    return rslt;
  }

  asObjectNodeMapping(): TermMapping<RDF.Quad_Object, N> {
    return new TermMapping<RDF.Quad_Object, N>(
      this.objectNodeGenerator(),
      this.getPrefix
    );
  }

  private objectNodeGenerator(): Map<RDF.Quad_Object, N[]> {
    const seenSubjects = new Set<string>();
    const seenPredicates = new Map<string, RDF.Quad_Predicate>();
    const seenObjects = new Set<RDF.Quad_Object>();

    const rslt = new Map<RDF.Quad_Object, N[]>();

    // collect all unique predicates and subjects in the current dataset
    for (const quad of this.dataset) {
      seenSubjects.add(quad.subject.value);
      seenPredicates.set(quad.predicate.value, quad.predicate);
      seenObjects.add(quad.object);
    }
    for (const object of seenObjects) {
      const allNodes = this._objectToNodes.get(object.value);
      if (allNodes) {
        const nodes = [];

        for (const node of allNodes) {
          const nodeSubject = this.getSubjectForNode(node);
          const nodePredicates = this.getPredicatesForNode(node);
          if (
            nodeSubject &&
            seenSubjects.has(nodeSubject.value) &&
            nodePredicates &&
            MapUtils.hasAny(
              seenPredicates,
              ...[...nodePredicates].map((pred) => pred.value)
            )
          ) {
            nodes.push(node);
          }
        }
        rslt.set(object, nodes);
      }
    }
    return rslt;
  }

  asQuadResultSet(): ResultSet<RDF.Quad> {
    return new ResultSet<RDF.Quad>(this.quadGenerator());
  }

  private *quadGenerator(): Generator<RDF.Quad> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  *asSubjectNodes(): Generator<SubjectNodesResponse<N>> {
    const seenSubjects = new Set<string>();
    for (const quad of this.dataset) {
      if (!seenSubjects.has(quad.subject.value)) {
        const nodes = this._subjectToNodes.get(quad.subject.value);
        if (nodes) {
          yield { subject: quad.subject, nodes: new Set<N>(nodes) };
        }
        seenSubjects.add(quad.subject.value);
      }
    }
  }

  *asPredicateNodes(): Generator<PredicateNodesResponse<N>> {
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
        const nodes = new Set<N>();
        // we have to filter out nodes that belong to a subject which is not in the dataset
        for (const node of allNodes) {
          const nodeSubject = this.getSubjectForNode(node);
          if (nodeSubject && seenSubjects.has(nodeSubject.value)) {
            nodes.add(node);
          }
        }
        yield { predicate: seenPredicates.get(pred)!, nodes };
      }
    }
  }

  *asObjectNodes(): Generator<ObjectNodesResponse<N>> {
    const mapping = this.asObjectNodeMapping();
    for (const entry of mapping) {
      yield { object: entry.term, nodes: new Set(entry.nodes) };
    }
  }

  *asQuads(): Generator<RDF.Quad> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  transformDataset(
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset
  ): this {
    return this.fromDataset(
      this._documentRoot,
      action(this.dataset, this.termConverter)
    );
  }

  protected fromDataset(documentRoot: N, dataset: RDF.Dataset): this {
    const Clazz = this.constructor as new (
      config: GenericDatastoreConfig<N>
    ) => this;
    return new Clazz({
      documentRoot,
      dataset,
      nodeToSubject: this._nodeToSubject,
      subjectToNodes: this._subjectToNodes,
      predicateToNodes: this._predicateToNodes,
      nodeToPredicates: this._nodeToPredicates,
      nodeToObjects: this._nodeToObjects,
      objectToNodes: this._objectToNodes,
      prefixMapping: this._prefixMapping,
      quadToNodes: this._quadToNodes,
      getParent: this._getParent,
    });
  }

  private getSubjectForNode(node: N) {
    let current: N | null = node;
    let subject;
    while (current && !subject) {
      subject = this._nodeToSubject.get(current);
      current = this._getParent(current, this._documentRoot);
    }
    return subject;
  }

  private getPredicatesForNode(node: N) {
    let current: N | null = node;
    let predicates;
    while (current && !predicates) {
      predicates = this._nodeToPredicates.get(current);
      current = this._getParent(current, this._documentRoot);
    }
    return predicates;
  }

  private getPrefix = (prefix: string): string | null => {
    return this._prefixMapping.get(prefix) || null;
  };
}

export interface ProseDatastore extends Datastore<ResolvedPNode> {
  limitToRange(state: EditorState, start: number, end: number): ProseStore;
}

export class ProseStore
  extends EditorStore<ResolvedPNode>
  implements ProseDatastore
{
  limitToRange(state: EditorState, start: number, end: number): ProseStore {
    const contextNodes: Set<PNode> = new Set();
    state.doc.nodesBetween(start, end, (node) => {
      contextNodes.add(node);
    });
    console.log('CONTEXT NODES: ', contextNodes);

    return this.transformDataset((dataset) => {
      return dataset.filter((quad) => {
        const quadNodes = this._quadToNodes.get(quadHash(quad));
        if (quadNodes) {
          const { subjectNodes, predicateNodes, objectNodes } = quadNodes;
          const hasSubjectNode = SetUtils.hasAny(
            contextNodes,
            ...subjectNodes.map((resolvedNode) => resolvedNode.node)
          );
          const hasPredicateNode = SetUtils.hasAny(
            contextNodes,
            ...predicateNodes.map((resolvedNode) => resolvedNode.node)
          );
          const hasObjectNode = SetUtils.hasAny(
            contextNodes,
            ...objectNodes.map((resolvedNode) => resolvedNode.node)
          );

          return hasSubjectNode && hasPredicateNode && hasObjectNode;
        } else {
          return false;
        }
      });
    });
  }
}

export function proseStoreFromParse(config: RdfaParseConfig<ResolvedPNode>) {
  const {
    dataset,
    subjectToNodesMapping,
    nodeToSubjectMapping,
    objectToNodesMapping,
    nodeToObjectsMapping,
    predicateToNodesMapping,
    nodeToPredicatesMapping,
    quadToNodesMapping,
    seenPrefixes,
  } = RdfaParser.parse(config);
  const prefixMap = new Map<string, string>(Object.entries(defaultPrefixes));
  for (const [key, value] of seenPrefixes.entries()) {
    prefixMap.set(key, value);
  }

  return new ProseStore({
    documentRoot: config.root,
    dataset,
    subjectToNodes: subjectToNodesMapping,
    nodeToSubject: nodeToSubjectMapping,
    prefixMapping: prefixMap,
    objectToNodes: objectToNodesMapping,
    nodeToObjects: nodeToObjectsMapping,
    predicateToNodes: predicateToNodesMapping,
    nodeToPredicates: nodeToPredicatesMapping,
    quadToNodes: quadToNodesMapping,
    getParent: config.getParent,
  });
}
