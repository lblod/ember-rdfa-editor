import { EditorState, PluginKey } from 'prosemirror-state';
import { PNode, ProsePlugin } from '#root/prosemirror-aliases.ts';
import MapUtils from '#root/utils/_private/map-utils.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';

export function getRdfaId(node: PNode): string | undefined {
  return node.attrs['__rdfaId'] as string | undefined;
}

export function getSubject(node: PNode): string | undefined {
  return (node.attrs['subject'] ??
    node.attrs['about'] ??
    node.attrs['resource']) as string | undefined;
}
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
    const importedResources: string[] | undefined =
      this.state.doc.attrs[IMPORTED_RESOURCES_ATTR];
    if (importedResources) {
      // This document defines additional external resources that can be used in RDFa relationships,
      // such as when editing a snippet. Add those resources to those available in the document.
      importedResources.forEach((imported) => {
        MapUtils.setOrPush(subjectMapping, imported, {
          pos: -1,
          value: doc,
        });
      });
    }
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
