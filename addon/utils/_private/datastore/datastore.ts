import * as RDF from '@rdfjs/types';
import {
  ModelQuad,
  quadHash,
  QuadNodes,
  RdfaParseConfig,
  RdfaParser,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-parser/rdfa-parser';
import {
  ConciseTerm,
  conciseToRdfjs,
  TermConverter,
} from '@lblod/ember-rdfa-editor/utils/_private/concise-term-string';
import { defaultPrefixes } from '@lblod/ember-rdfa-editor/config/rdfa';
import { ResultSet } from '@lblod/ember-rdfa-editor/utils/_private/datastore/result-set';
import { TermMapping } from '@lblod/ember-rdfa-editor/utils/_private/datastore/term-mapping';
import {
  isPrimitive,
  ObjectSpec,
  PredicateSpec,
  SubjectSpec,
} from '@lblod/ember-rdfa-editor/utils/_private/datastore/term-spec';
import { GraphyDataset } from './graphy-dataset';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

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
    object?: ObjectSpec,
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
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset,
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

  nodesForQuad(quad: RDF.Quad): QuadNodes<N> | null;
}

interface DatastoreConfig<N> {
  documentRoot: N;
  dataset: RDF.Dataset;
  subjectToNodes: Map<string, N[]>;
  nodeToSubject: Map<N, ModelQuad<N>>;

  predicateToNodes: Map<string, N[]>;
  nodeToPredicates: Map<N, Set<ModelQuad<N>>>;

  objectToNodes: Map<string, N[]>;
  nodeToObjects: Map<N, Set<ModelQuad<N>>>;
  quadToNodes: Map<string, QuadNodes<N>>;
  prefixMapping: Map<string, string>;
}

interface GenericDatastoreConfig<N> extends DatastoreConfig<N> {
  attributes: (node: N) => Record<string, string>;
}

export class EditorStore<N> implements Datastore<N> {
  protected _documentRoot: N;
  protected _dataset: RDF.Dataset;
  protected _subjectToNodes: Map<string, N[]>;
  protected _nodeToSubject: Map<N, ModelQuad<N>>;
  protected _prefixMapping: Map<string, string>;
  protected _nodeToPredicates: Map<N, Set<ModelQuad<N>>>;
  protected _predicateToNodes: Map<string, N[]>;
  protected _nodeToObjects: Map<N, Set<ModelQuad<N>>>;
  protected _objectToNodes: Map<string, N[]>;
  protected _quadToNodes: Map<string, QuadNodes<N>>;
  protected _attributes: (node: N) => Record<string, string>;

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
    attributes,
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
    this._attributes = attributes;
  }

  static empty<N>(
    documentRoot: N,
    getParent: (node: N) => N | null,
    attributes: (node: N) => Record<string, string>,
  ): Datastore<N> {
    const subjectToNodes = new Map<string, N[]>();
    const nodeToSubject = new Map<N, ModelQuad<N>>();
    const prefixMapping = new Map<string, string>();
    const nodeToPredicates = new Map<N, Set<ModelQuad<N>>>();
    const predicateToNodes = new Map<string, N[]>();
    const nodeToObjects = new Map<N, Set<ModelQuad<N>>>();
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
      attributes,
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
      attributes: config.attributes,
    });
  }

  get dataset(): RDF.Dataset {
    return this._dataset;
  }

  get size(): number {
    return this._dataset.size;
  }

  termConverter = (term: ConciseTerm) => conciseToRdfjs(term, this.getPrefix);

  nodesForQuad(quad: RDF.Quad): QuadNodes<N> | null {
    return this._quadToNodes.get(quadHash(quad)) ?? null;
  }

  match(
    subject?: SubjectSpec,
    predicate?: PredicateSpec,
    object?: ObjectSpec,
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
      null,
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
      this.getPrefix,
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
      this.getPrefix,
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
          const quads = unwrap(this._nodeToPredicates.get(node));
          for (const quad of quads) {
            if (seenSubjects.has(quad.subject.value)) {
              nodes.push(node);
            }
          }
        }
        rslt.set(unwrap(seenPredicates.get(pred)), nodes);
      }
    }
    return rslt;
  }

  asObjectNodeMapping(): TermMapping<RDF.Quad_Object, N> {
    return new TermMapping<RDF.Quad_Object, N>(
      this.objectNodeGenerator(),
      this.getPrefix,
    );
  }

  private objectNodeGenerator(): Map<RDF.Quad_Object, N[]> {
    const seenSubjects = new Set<string>();
    const seenPredicates = new Set<string>();
    const seenObjects = new Set<RDF.Quad_Object>();

    const rslt = new Map<RDF.Quad_Object, N[]>();

    // collect all unique predicates and subjects in the current dataset
    for (const quad of this.dataset) {
      seenSubjects.add(quad.subject.value);
      seenPredicates.add(quad.predicate.value);
      seenObjects.add(quad.object);
    }
    for (const object of seenObjects) {
      const allNodes = this._objectToNodes.get(object.value);
      if (allNodes) {
        const nodes = [];

        for (const node of allNodes) {
          const quads = unwrap(this._nodeToObjects.get(node));
          for (const quad of quads) {
            if (
              seenSubjects.has(quad.subject.value) &&
              seenPredicates.has(quad.predicate.value)
            ) {
              nodes.push(node);
            }
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
    const mapping = this.asSubjectNodeMapping();
    for (const entry of mapping) {
      yield { subject: entry.term, nodes: new Set(entry.nodes) };
    }
  }

  *asPredicateNodes(): Generator<PredicateNodesResponse<N>> {
    const mapping = this.asPredicateNodeMapping();
    for (const entry of mapping) {
      yield { predicate: entry.term, nodes: new Set(entry.nodes) };
    }
  }

  *asObjectNodes(): Generator<ObjectNodesResponse<N>> {
    const mapping = this.asObjectNodeMapping();
    for (const entry of mapping) {
      yield { object: entry.term, nodes: new Set(entry.nodes) };
    }
  }

  *asQuads(): Generator<RDF.Quad, void, undefined> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  transformDataset(
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset,
  ): this {
    return this.fromDataset(
      this._documentRoot,
      action(this.dataset, this.termConverter),
    );
  }

  protected fromDataset(documentRoot: N, dataset: RDF.Dataset): this {
    const Clazz = this.constructor as new (
      config: GenericDatastoreConfig<N>,
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
      attributes: this._attributes,
    });
  }

  private getPrefix = (prefix: string): string | null => {
    return this._prefixMapping.get(prefix) || null;
  };
}
