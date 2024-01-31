import { EditorState, PluginKey } from 'prosemirror-state';
import { ProsePlugin } from '@lblod/ember-rdfa-editor';
import {
  getRdfaId,
  getSubject,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import MapUtils from '@lblod/ember-rdfa-editor/utils/_private/map-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

class RdfaInfo {
  private state: EditorState;
  private _rdfaIdMapping?: Map<string, ResolvedPNode>;
  private _subjectMapping?: Map<string, ResolvedPNode[]>;
  constructor(state: EditorState) {
    this.state = state;
  }

  private computeMappings() {
    const rdfaIdMapping: Map<string, ResolvedPNode> = new Map();
    const subjectMapping: Map<string, ResolvedPNode[]> = new Map();
    const { doc } = this.state;
    doc.descendants((node, pos) => {
      const rdfaId = getRdfaId(node);
      const subject = getSubject(node);
      if (rdfaId) {
        rdfaIdMapping.set(rdfaId, {
          pos,
          value: node,
        });
      }
      if (subject) {
        MapUtils.setOrPush(subjectMapping, subject, {
          pos,
          value: node,
        });
      }
      return true;
    });
    const rdfaId = getRdfaId(doc);
    const subject = getSubject(doc);
    if (rdfaId) {
      rdfaIdMapping.set(rdfaId, { pos: -1, value: doc });
    }
    if (subject) {
      MapUtils.setOrPush(subjectMapping, subject, { pos: -1, value: doc });
    }
    this._rdfaIdMapping = rdfaIdMapping;
    this._subjectMapping = subjectMapping;
  }

  get rdfaIdMapping() {
    if (!this._rdfaIdMapping) {
      this.computeMappings();
    }
    return unwrap(this._rdfaIdMapping);
  }

  get subjectMapping() {
    if (!this._subjectMapping) {
      this.computeMappings();
    }
    return unwrap(this._subjectMapping);
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
 * In RDFA, many nodes can define the same subject, find all of those nodes
 * @param state
 * @param subject - Subject URI
 */
export function getNodesBySubject(state: EditorState, subject: string) {
  return rdfaInfoPluginKey.getState(state)?.subjectMapping.get(subject) ?? [];
}

export function getRdfaIds(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.rdfaIdMapping.keys()] : [];
}

export function getSubjects(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.subjectMapping.keys()] : [];
}
