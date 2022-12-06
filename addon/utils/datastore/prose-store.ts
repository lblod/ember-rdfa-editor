import {
  quadHash,
  RdfaParseConfig,
  RdfaParser,
} from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import { Node as PNode } from 'prosemirror-model';
import { defaultPrefixes } from '@lblod/ember-rdfa-editor/config/rdfa';
import { EditorState } from 'prosemirror-state';
import SetUtils from '@lblod/ember-rdfa-editor/utils/set-utils';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';

export interface ProseDatastore extends Datastore<PNode> {
  limitToRange(state: EditorState, start: number, end: number): ProseStore;
}

export class ProseStore extends EditorStore<PNode> implements ProseDatastore {
  limitToRange(state: EditorState, start: number, end: number): ProseStore {
    const contextNodes = new Set();
    state.doc.nodesBetween(start, end, (node) => {
      contextNodes.add(node);
    });

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
}

export function proseStoreFromParse(config: RdfaParseConfig<PNode>) {
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
