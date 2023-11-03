import { EditorState, PluginKey } from 'prosemirror-state';
import { ProsePlugin, ResolvedPos } from '@lblod/ember-rdfa-editor';
import {
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import MapUtils from '@lblod/ember-rdfa-editor/utils/_private/map-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

class RdfaInfo {
  private state: EditorState;
  private _rdfaIdMapping?: Map<string, ResolvedPos>;
  private _resourceMapping?: Map<string, ResolvedPos[]>;
  constructor(state: EditorState) {
    this.state = state;
  }

  private computeMappings() {
    const rdfaIdMapping = new Map();
    const resourceMapping = new Map();
    const { doc } = this.state;
    doc.descendants((node, pos) => {
      const resolvedPos = doc.resolve(pos);
      const rdfaId = getRdfaId(node);
      const resource = getResource(node);
      if (rdfaId) {
        rdfaIdMapping.set(rdfaId, resolvedPos);
      }
      if (resource) {
        MapUtils.setOrPush(resourceMapping, resource, resolvedPos);
      }
      return true;
    });
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

export function getPositionByRdfaId(state: EditorState, rdfaId: string) {
  return rdfaInfoPluginKey.getState(state)?.rdfaIdMapping.get(rdfaId);
}

export function getPositionsByResource(state: EditorState, resource: string) {
  return rdfaInfoPluginKey.getState(state)?.resourceMapping.get(resource);
}
