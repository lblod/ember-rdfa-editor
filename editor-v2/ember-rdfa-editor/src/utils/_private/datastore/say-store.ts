import {
  quadHash,
  type RdfaParseConfig,
  RdfaParser,
} from '#root/utils/_private/rdfa-parser/rdfa-parser.ts';
import { defaultPrefixes } from '#root/config/rdfa.ts';
import { EditorState } from 'prosemirror-state';
import {
  type default as Datastore,
  EditorStore,
} from '#root/utils/_private/datastore/datastore.ts';
import type { DatastoreResolvedPNode } from '#root/plugins/datastore/datastore-node-types.ts';

export interface SayDatastore extends Datastore<DatastoreResolvedPNode> {
  limitToRange(state: EditorState, start: number, end: number): SayStore;
}

export type LimitToRangeStrategy = 'rangeIsInside' | 'rangeContains';

export class SayStore
  extends EditorStore<DatastoreResolvedPNode>
  implements SayDatastore
{
  limitToRange(
    state: EditorState,
    start: number,
    end: number,
    strategy: LimitToRangeStrategy = 'rangeIsInside',
  ): SayStore {
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

export function proseStoreFromParse(
  config: RdfaParseConfig<DatastoreResolvedPNode>,
) {
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
    resourceNodeMapping,
    contentNodeMapping,
  } = RdfaParser.parse(config);
  const prefixMap = new Map<string, string>(Object.entries(defaultPrefixes));
  for (const [key, value] of seenPrefixes.entries()) {
    prefixMap.set(key, value);
  }

  return new SayStore({
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
    resourceNodeMapping,
    contentNodeMapping,
  });
}
