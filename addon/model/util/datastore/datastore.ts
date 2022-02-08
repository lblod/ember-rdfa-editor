import * as RDF from '@rdfjs/types';
import ModelRange, {
  RangeContextStrategy,
} from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import {
  ModelQuadObject,
  ModelQuadPredicate,
  ModelQuadSubject,
  RdfaParseConfig,
  RdfaParser,
} from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import {
  ConciseTerm,
  conciseToRdfjs,
  TermConverter,
} from '@lblod/ember-rdfa-editor/model/util/concise-term-string';
import { defaultPrefixes } from '@lblod/ember-rdfa-editor/config/rdfa';
import { ResultSet } from '@lblod/ember-rdfa-editor/model/util/datastore/result-set';
import { TermMapping } from '@lblod/ember-rdfa-editor/model/util/datastore/term-mapping';
import {
  isPrimitive,
  ObjectSpec,
  PredicateSpec,
  SubjectSpec,
} from '@lblod/ember-rdfa-editor/model/util/datastore/term-spec';

export default interface Datastore {
  get dataset(): RDF.Dataset;

  get size(): number;

  get termConverter(): TermConverter;

  limitToRange(range: ModelRange, strategy?: RangeContextStrategy): Datastore;

  match(
    subject?: SubjectSpec,
    predicate?: PredicateSpec,
    object?: ObjectSpec
  ): Datastore;

  transformDataset(
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset
  ): Datastore;

  asSubjectNodes(): TermMapping<RDF.Quad_Subject>;

  asPredicateNodes(): TermMapping<RDF.Quad_Predicate>;

  asObjectNodes(): TermMapping<RDF.Quad_Object>;

  asQuads(): ResultSet<RDF.Quad>;
}

interface DatastoreConfig {
  dataset: RDF.Dataset;
  subjectToNodes: Map<string, ModelNode[]>;
  nodeToSubject: Map<ModelNode, ModelQuadSubject>;

  predicateToNodes: Map<string, ModelNode[]>;
  nodeToPredicates: Map<ModelNode, Set<ModelQuadPredicate>>;

  objectToNodes: Map<string, ModelNode[]>;
  nodeToObjects: Map<ModelNode, Set<ModelQuadObject>>;
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

  constructor({
    dataset,
    nodeToSubject,
    subjectToNodes,
    prefixMapping,
    nodeToPredicates,
    predicateToNodes,
    nodeToObjects,
    objectToNodes,
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
      nodeToPredicatesMapping,
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
      nodeToPredicates: nodeToPredicatesMapping,
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
      prefixMapping: this._prefixMapping,
    });
  }

  asSubjectNodes(): TermMapping<RDF.Quad_Subject> {
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

  asPredicateNodes(): TermMapping<RDF.Quad_Predicate> {
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
          const nodeSubject = this._nodeToSubject.get(node);
          if (nodeSubject && seenSubjects.has(nodeSubject.value)) {
            nodes.push(node);
          }
        }
        rslt.set(seenPredicates.get(pred)!, nodes);
      }
    }
    return rslt;
  }

  asObjectNodes(): TermMapping<RDF.Quad_Object> {
    return new TermMapping<RDF.Quad_Object>(
      this.objectNodeGenerator(),
      this.getPrefix
    );
  }

  private objectNodeGenerator(): Map<RDF.Quad_Object, ModelNode[]> {
    const seenObjects = new Set<string>();
    const rslt = new Map<RDF.Quad_Object, ModelNode[]>();
    for (const quad of this.dataset) {
      if (!seenObjects.has(quad.object.value)) {
        const nodes = this._objectToNodes.get(quad.object.value);
        if (nodes) {
          rslt.set(quad.object, nodes);
        }
        seenObjects.add(quad.object.value);
      }
    }
    return rslt;
  }

  asQuads(): ResultSet<RDF.Quad> {
    return new ResultSet<RDF.Quad>(this.quadGenerator());
  }

  private *quadGenerator(): Generator<RDF.Quad> {
    for (const quad of this.dataset) {
      yield quad;
    }
  }

  transformDataset(
    action: (dataset: RDF.Dataset, termconverter: TermConverter) => RDF.Dataset
  ): Datastore {
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
      prefixMapping: this._prefixMapping,
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

  private getPrefix = (prefix: string): string | null => {
    return this._prefixMapping.get(prefix) || null;
  };
}
