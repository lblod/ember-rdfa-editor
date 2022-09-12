import * as RDF from '@rdfjs/types';
import ModelRange, {
  RangeContextStrategy,
} from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
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
import {
  matchText,
  TextMatch,
} from '@lblod/ember-rdfa-editor/utils/match-text';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import SetUtils from '@lblod/ember-rdfa-editor/utils/set-utils';
import { GraphyDataset } from './graphy-dataset';

interface TermNodesResponse {
  nodes: Set<ModelNode>;
}

interface SubjectNodesResponse extends TermNodesResponse {
  subject: RDF.Quad_Subject;
}

interface PredicateNodesResponse extends TermNodesResponse {
  predicate: RDF.Quad_Predicate;
}

interface ObjectNodesResponse extends TermNodesResponse {
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
export default interface Datastore {
  get dataset(): RDF.Dataset;

  get size(): number;

  /**
   * The function used to convert concise term syntax (see {@link ConciseTerm})
   * into RDFjs term objects
   */
  get termConverter(): TermConverter;

  /**
   * Transformer method.
   * Filters out any triples of which their subject does not have a node within the given range's context nodes
   * The definition of a range's context nodes depends on the strategy.
   * More info at {@link ModelRange.contextNodes}
   * @param range
   * @param strategy
   */
  limitToRange(range: ModelRange, strategy?: RangeContextStrategy): Datastore;

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
  ): Datastore;

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
  ): Datastore;

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
  asSubjectNodeMapping(): TermMapping<RDF.Quad_Subject>;

  /**
   * Consumer method.
   * Returns a {@link TermMapping} of the currently valid predicates and the nodes that define them.
   */
  asPredicateNodeMapping(): TermMapping<RDF.Quad_Predicate>;

  /**
   * Consumer method.
   * Returns a {@link TermMapping} of the currently valid objects and the nodes that define them.
   */
  asObjectNodeMapping(): TermMapping<RDF.Quad_Object>;

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
  asSubjectNodes(): Generator<SubjectNodesResponse>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of mappings between predicates and their nodes.
   * No order is implied.
   */
  asPredicateNodes(): Generator<PredicateNodesResponse>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of mappings between objects and their nodes.
   * No order is implied.
   */
  asObjectNodes(): Generator<ObjectNodesResponse>;

  /**
   * @deprecated
   * Consumer Method.
   * Returns a generator of current relevant quads
   */
  asQuads(): Generator<RDF.Quad>;

  searchTextIn(whichTerm: WhichTerm, regex: RegExp): TextMatch[];
}

interface DatastoreConfig {
  dataset: RDF.Dataset;
  subjectToNodes: Map<string, ModelNode[]>;
  nodeToSubject: Map<ModelNode, ModelQuadSubject>;

  predicateToNodes: Map<string, ModelNode[]>;
  nodeToPredicates: Map<ModelNode, Set<ModelQuadPredicate>>;

  objectToNodes: Map<string, ModelNode[]>;
  nodeToObjects: Map<ModelNode, Set<ModelQuadObject>>;
  quadToNodes: Map<string, QuadNodes>;
  prefixMapping: Map<string, string>;
}

export class EditorStore implements Datastore {
  private _dataset: RDF.Dataset;
  private _subjectToNodes: Map<string, ModelNode[]>;
  private _nodeToSubject: Map<ModelNode, ModelQuadSubject>;
  private _prefixMapping: Map<string, string>;
  private _nodeToPredicates: Map<ModelNode, Set<ModelQuadPredicate>>;
  private _predicateToNodes: Map<string, ModelNode[]>;
  private _nodeToObjects: Map<ModelNode, Set<ModelQuadObject>>;
  private _objectToNodes: Map<string, ModelNode[]>;
  private _quadToNodes: Map<string, QuadNodes>;

  constructor({
    dataset,
    nodeToSubject,
    subjectToNodes,
    prefixMapping,
    nodeToPredicates,
    predicateToNodes,
    nodeToObjects,
    objectToNodes,
    quadToNodes,
  }: DatastoreConfig) {
    this._dataset = dataset;
    this._nodeToSubject = nodeToSubject;
    this._subjectToNodes = subjectToNodes;
    this._prefixMapping = prefixMapping;
    this._nodeToPredicates = nodeToPredicates;
    this._predicateToNodes = predicateToNodes;
    this._nodeToObjects = nodeToObjects;
    this._objectToNodes = objectToNodes;
    this._quadToNodes = quadToNodes;
  }
  static empty(): Datastore {
    const subjectToNodes = new Map<string, ModelNode[]>();
    const nodeToSubject = new Map<ModelNode, ModelQuadSubject>();
    const prefixMapping = new Map<string, string>();
    const nodeToPredicates = new Map<ModelNode, Set<ModelQuadPredicate>>();
    const predicateToNodes = new Map<string, ModelNode[]>();
    const nodeToObjects = new Map<ModelNode, Set<ModelQuadObject>>();
    const objectToNodes = new Map<string, ModelNode[]>();
    const quadToNodes = new Map<string, QuadNodes>();
    return new EditorStore({
      dataset: new GraphyDataset(),
      subjectToNodes,
      nodeToObjects,
      prefixMapping,
      nodeToPredicates,
      nodeToSubject,
      quadToNodes,
      objectToNodes,
      predicateToNodes,
    });
  }

  static fromParse(config: RdfaParseConfig): Datastore {
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

    return new EditorStore({
      dataset,
      subjectToNodes: subjectToNodesMapping,
      nodeToSubject: nodeToSubjectMapping,
      prefixMapping: prefixMap,
      objectToNodes: objectToNodesMapping,
      nodeToObjects: nodeToObjectsMapping,
      predicateToNodes: predicateToNodesMapping,
      nodeToPredicates: nodeToPredicatesMapping,
      quadToNodes: quadToNodesMapping,
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
  ): Datastore {
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
    return this.fromDataset(newSet);
  }

  limitToRange(range: ModelRange, strategy: RangeContextStrategy): Datastore {
    const contextNodes = new Set(range.contextNodes(strategy));
    return this.transformDataset((dataset) => {
      return dataset.filter((quad) => {
        const quadNodes = this._quadToNodes.get(quadHash(quad));
        if (quadNodes) {
          const { subjectNodes, predicateNodes, objectNodes } = quadNodes;
          const hasSubjectNode = SetUtils.hasAny(contextNodes, ...subjectNodes);
          const hasPredicateNode = SetUtils.hasAny(
            contextNodes,
            ...predicateNodes
          );
          const hasObjectNode = SetUtils.hasAny(contextNodes, ...objectNodes);
          return hasSubjectNode && hasPredicateNode && hasObjectNode;
        } else {
          return false;
        }
      });
    });
  }

  withExtraPrefixes(prefixes: Record<string, string>): this {
    for (const [key, value] of Object.entries(prefixes)) {
      this._prefixMapping.set(key, value);
    }
    return this;
  }

  asSubjectNodeMapping(): TermMapping<RDF.Quad_Subject> {
    return new TermMapping<RDF.Quad_Subject>(
      this.subjectNodeGenerator(),
      this.getPrefix
    );
  }

  private subjectNodeGenerator(): Map<RDF.Quad_Subject, ModelNode[]> {
    const seenSubjects = new Set<string>();
    const rslt = new Map<RDF.Quad_Subject, ModelNode[]>();
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

  asPredicateNodeMapping(): TermMapping<RDF.Quad_Predicate> {
    return new TermMapping<RDF.Quad_Predicate>(
      this.predicateNodeGenerator(),
      this.getPrefix
    );
  }

  private predicateNodeGenerator(): Map<RDF.Quad_Predicate, ModelNode[]> {
    const seenPredicates = new Map<string, RDF.Quad_Predicate>();
    const seenSubjects = new Set<string>();
    const rslt = new Map<RDF.Quad_Predicate, ModelNode[]>();

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

  asObjectNodeMapping(): TermMapping<RDF.Quad_Object> {
    return new TermMapping<RDF.Quad_Object>(
      this.objectNodeGenerator(),
      this.getPrefix
    );
  }

  private objectNodeGenerator(): Map<RDF.Quad_Object, ModelNode[]> {
    const seenSubjects = new Set<string>();
    const seenPredicates = new Map<string, RDF.Quad_Predicate>();
    const seenObjects = new Set<RDF.Quad_Object>();

    const rslt = new Map<RDF.Quad_Object, ModelNode[]>();

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

  *asSubjectNodes(): Generator<SubjectNodesResponse> {
    const seenSubjects = new Set<string>();
    for (const quad of this.dataset) {
      if (!seenSubjects.has(quad.subject.value)) {
        const nodes = this._subjectToNodes.get(quad.subject.value);
        if (nodes) {
          yield { subject: quad.subject, nodes: new Set<ModelNode>(nodes) };
        }
        seenSubjects.add(quad.subject.value);
      }
    }
  }

  *asPredicateNodes(): Generator<PredicateNodesResponse> {
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
          const nodeSubject = this.getSubjectForNode(node);
          if (nodeSubject && seenSubjects.has(nodeSubject.value)) {
            nodes.add(node);
          }
        }
        yield { predicate: seenPredicates.get(pred)!, nodes };
      }
    }
  }

  *asObjectNodes(): Generator<ObjectNodesResponse> {
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
  ): Datastore {
    return this.fromDataset(action(this.dataset, this.termConverter));
  }

  searchTextIn(whichTerm: WhichTerm, regex: RegExp): TextMatch[] {
    const results = [];
    let mapping: TermMapping<RDF.Term>;
    if (whichTerm === 'subject') {
      mapping = this.asSubjectNodeMapping();
    } else if (whichTerm === 'predicate') {
      mapping = this.asPredicateNodeMapping();
    } else {
      mapping = this.asObjectNodeMapping();
    }
    for (const node of mapping.nodes()) {
      let searchRange;
      // we test if the node is root, which will be the case when the
      // rdfa knowledge is defined above the document root.
      if (node.parent) {
        searchRange = ModelRange.fromAroundNode(node);
      } else {
        searchRange = ModelRange.fromInNode(node);
      }
      results.push(...matchText(searchRange, regex));
    }
    return results;
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
      prefixMapping: this._prefixMapping,
      quadToNodes: this._quadToNodes,
    });
  }

  private subjectsForRange(
    range: ModelRange,
    strategy: RangeContextStrategy
  ): Set<string> {
    const subjects = new Set<string>();
    for (const node of range.contextNodes(strategy)) {
      const subject = this._nodeToSubject.get(node);
      if (subject) {
        subjects.add(subject.value);
      }
    }
    return subjects;
  }

  private getSubjectForNode(node: ModelNode) {
    let current: ModelNode | null = node;
    let subject;
    while (current && !subject) {
      subject = this._nodeToSubject.get(current);
      current = current.parent;
    }
    return subject;
  }

  private getPredicatesForNode(node: ModelNode) {
    let current: ModelNode | null = node;
    let predicates;
    while (current && !predicates) {
      predicates = this._nodeToPredicates.get(current);
      current = current.parent;
    }
    return predicates;
  }

  private getPrefix = (prefix: string): string | null => {
    return this._prefixMapping.get(prefix) || null;
  };
}
