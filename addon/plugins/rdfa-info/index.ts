import { EditorState, PluginKey } from 'prosemirror-state';
import { PNode, ProsePlugin } from '@lblod/ember-rdfa-editor';
import {
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import MapUtils from '@lblod/ember-rdfa-editor/utils/_private/map-utils';

export const rdfaInfoPluginKey = new PluginKey<RdfaInfoState>('rdfa_info');

export interface RdfaInfoState {
  rdfaIdMapping: Map<string, number>;
  resourceMapping: Map<string, Set<number>>;
}

function computeRdfaInfo(doc: PNode): RdfaInfoState {
  const result: RdfaInfoState = {
    rdfaIdMapping: new Map(),
    resourceMapping: new Map(),
  };
  doc.descendants((node, pos) => {
    const rdfaId = getRdfaId(node);
    const resource = getResource(node);
    if (rdfaId) {
      result.rdfaIdMapping.set(rdfaId, pos);
    }
    if (resource) {
      MapUtils.setOrAdd(result.resourceMapping, resource, pos);
    }
    return true;
  });
  return result;
}

export function rdfaInfoPlugin() {
  return new ProsePlugin<RdfaInfoState>({
    key: rdfaInfoPluginKey,
    state: {
      init(_config, state) {
        return computeRdfaInfo(state.doc);
      },
      apply(tr, oldInfo, _oldState, newState) {
        if (!tr.docChanged) {
          return oldInfo;
        }
        return computeRdfaInfo(newState.doc);
      },
    },
  });
}

export function getPositionByRdfaId(rdfaId: string, state: EditorState) {
  return rdfaInfoPluginKey.getState(state)?.rdfaIdMapping.get(rdfaId);
}

export function getPositionsByResource(resource: string, state: EditorState) {
  return rdfaInfoPluginKey.getState(state)?.resourceMapping.get(resource);
}
