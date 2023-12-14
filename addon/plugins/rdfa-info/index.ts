import { EditorState, PluginKey } from 'prosemirror-state';
import { ProsePlugin } from '@lblod/ember-rdfa-editor';
import {
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import MapUtils from '@lblod/ember-rdfa-editor/utils/_private/map-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

class RdfaInfo {
  private state: EditorState;
  private _rdfaIdMapping?: Map<string, ResolvedPNode>;
  private _resourceMapping?: Map<string, ResolvedPNode[]>;
  constructor(state: EditorState) {
    this.state = state;
  }

  private computeMappings() {
    const rdfaIdMapping: Map<string, ResolvedPNode> = new Map();
    const resourceMapping: Map<string, ResolvedPNode[]> = new Map();
    const { doc } = this.state;
    doc.descendants((node, pos) => {
      const rdfaId = getRdfaId(node);
      const resource = getResource(node);
      if (rdfaId) {
        rdfaIdMapping.set(rdfaId, {
          pos,
          value: node,
        });
      }
      if (resource) {
        MapUtils.setOrPush(resourceMapping, resource, {
          pos,
          value: node,
        });
      }
      return true;
    });
    const rdfaId = getRdfaId(doc);
    const resource = getResource(doc);
    if (rdfaId) {
      rdfaIdMapping.set(rdfaId, { pos: -1, value: doc });
    }
    if (resource) {
      MapUtils.setOrPush(resourceMapping, resource, { pos: -1, value: doc });
    }
    this._rdfaIdMapping = rdfaIdMapping;
    this._resourceMapping = resourceMapping;
  }

  get rdfaIdMapping() {
    if (!this._rdfaIdMapping) {
      this.computeMappings();
    }
    return unwrap(this._rdfaIdMapping);
  }

  get resourceMapping() {
    if (!this._resourceMapping) {
      this.computeMappings();
    }
    return unwrap(this._resourceMapping);
  }
}

export const rdfaInfoPluginKey = new PluginKey<RdfaInfo>('rdfa_info');

export function rdfaInfoPlugin() {
  return new ProsePlugin<RdfaInfo>({
    key: rdfaInfoPluginKey,
    state: {
      init(_config, state) {
        return new RdfaInfo(state);
      },
      apply(tr, oldInfo, _oldState, newState) {
        if (!tr.docChanged) {
          return oldInfo;
        }
        return new RdfaInfo(newState);
      },
    },
  });
}

export function getNodeByRdfaId(state: EditorState, rdfaId: string) {
  return rdfaInfoPluginKey.getState(state)?.rdfaIdMapping.get(rdfaId);
}

/**
 * In RDFA, many nodes can define the same resource, find all of those nodes
 * @param state
 * @param resource - Resource URI
 */
export function getNodesByResource(state: EditorState, resource: string) {
  return rdfaInfoPluginKey.getState(state)?.resourceMapping.get(resource) ?? [];
}

export function getRdfaIds(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.rdfaIdMapping.keys()] : [];
}

export function getResources(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.resourceMapping.keys()] : [];
}
