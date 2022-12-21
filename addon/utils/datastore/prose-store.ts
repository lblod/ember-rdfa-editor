import {
  quadHash,
  RdfaParseConfig,
  RdfaParser,
} from '@lblod/ember-rdfa-editor/utils/rdfa-parser/rdfa-parser';
import { defaultPrefixes } from '@lblod/ember-rdfa-editor/config/rdfa';
import { EditorState } from 'prosemirror-state';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';

export interface ProseDatastore extends Datastore<ResolvedPNode> {
  limitToRange(state: EditorState, start: number, end: number): ProseStore;
}

export type LimitToRangeStrategy = 'rangeIsInside' | 'rangeContains';

export class ProseStore
  extends EditorStore<ResolvedPNode>
  implements ProseDatastore
{
  limitToRange(
    state: EditorState,
    start: number,
    end: number,
    strategy: LimitToRangeStrategy = 'rangeIsInside'
  ): ProseStore {
    const comparisonFunction = (range: { from: number; to: number }) => {
      if (strategy === 'rangeIsInside') {
        return range.from <= start && range.to >= end;
      } else {
        return range.from >= start && range.to <= end;
      }
    };
    return this.transformDataset((dataset) => {
      return dataset.filter((quad) => {
        const quadNodes = this._quadToNodes.get(quadHash(quad));
        if (quadNodes) {
          const { subjectNodes, predicateNodes, objectNodes } = quadNodes;
          const hasSubjectNode = subjectNodes.some(comparisonFunction);
          const hasPredicateNode = predicateNodes.some(comparisonFunction);
          const hasObjectNode = objectNodes.some(comparisonFunction);
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
    attributes: config.attributes,
  });
}
