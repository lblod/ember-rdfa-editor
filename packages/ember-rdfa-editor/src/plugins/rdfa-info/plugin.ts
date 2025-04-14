import { EditorState, PluginKey } from 'prosemirror-state';
import { PNode, ProsePlugin } from '#root/prosemirror-aliases.ts';
import MapUtils from '#root/utils/_private/map-utils.ts';
import { isSome, unwrap } from '#root/utils/_private/option.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import { getBacklinks } from './utils.ts';

export function getRdfaId(node: PNode): string | undefined {
  return node.attrs['__rdfaId'] as string | undefined;
}

export function getSubject(node: PNode): string | undefined {
  return (node.attrs['subject'] ??
    node.attrs['about'] ??
    node.attrs['resource']) as string | undefined;
}

interface InfoMaps {
  rdfaIdMapping: Map<string, ResolvedPNode>;
  subjectMapping: Map<string, ResolvedPNode[]>;
  topLevelSubjects: Set<string>;
}
interface InfoEntries {
  rdfaIdMapping?: [string, ResolvedPNode];
  subjectMapping?: [string, ResolvedPNode];
  topLevelSubjects?: string;
}

function processNode(node: PNode, pos: number): InfoEntries {
  const newInfo: InfoEntries = {};
  const rdfaId = getRdfaId(node);
  const subject = getSubject(node);
  if (rdfaId) {
    newInfo.rdfaIdMapping = [
      rdfaId,
      {
        pos,
        value: node,
      },
    ];
  }
  if (subject) {
    newInfo.subjectMapping = [
      subject,
      {
        pos,
        value: node,
      },
    ];
    const backlinks = getBacklinks(node);
    if (!backlinks || backlinks.length === 0) {
      newInfo.topLevelSubjects = subject;
    }
  }
  return newInfo;
}
async function processNodeAsync(
  node: PNode,
  pos: number,
): Promise<InfoEntries> {
  return new Promise((resolve) => {
    resolve(processNode(node, pos));
  });
}

function consolidateInfo(entries: InfoEntries[]): InfoMaps {
  const newMaps: InfoMaps = {
    rdfaIdMapping: new Map<string, ResolvedPNode>(
      entries.map((entry) => entry.rdfaIdMapping).filter(isSome),
    ),
    subjectMapping: new Map<string, ResolvedPNode[]>(),
    topLevelSubjects: new Set<string>(
      entries.map((entry) => entry.topLevelSubjects).filter(isSome),
    ),
  };
  entries
    .map((entry) => entry.subjectMapping)
    .filter(isSome)
    .forEach(([subject, resolvedNode]) => {
      MapUtils.setOrPush(newMaps.subjectMapping, subject, resolvedNode);
    });

  return newMaps;
}

export class RdfaInfo {
  private state: EditorState;
  private _rdfaIdMapping?: Map<string, ResolvedPNode>;
  private _subjectMapping?: Map<string, ResolvedPNode[]>;
  // TODO This isn't actually that useful as 'loops' with no 'top level' subject are very easy to
  // set up. We need to figure out a better way to handle this, but for now just stick with this to
  // work on debouncing
  private _topLevelSubjects?: Set<string>;
  constructor(state: EditorState) {
    this.state = state;
  }

  async computeMappingsAsync(abortSignal: AbortSignal): Promise<InfoMaps> {
    if (this._rdfaIdMapping && this._subjectMapping && this._topLevelSubjects) {
      return {
        rdfaIdMapping: this._rdfaIdMapping,
        subjectMapping: this._subjectMapping,
        topLevelSubjects: this._topLevelSubjects,
      };
    }
    const newInfo: InfoEntries[] = [];
    const { doc } = this.state;
    const importedResources = this.state.doc.attrs[IMPORTED_RESOURCES_ATTR] as
      | string[]
      | undefined;
    if (importedResources) {
      // This document defines additional external resources that can be used in RDFa relationships,
      // such as when editing a snippet. Add those resources to those available in the document.
      importedResources.forEach((imported) => {
        newInfo.push({
          subjectMapping: [
            imported,
            {
              pos: -1,
              value: doc,
            },
          ],
        });
      });
    }
    const infoPromises: Promise<InfoEntries>[] = [];
    doc.descendants((node, pos) => {
      infoPromises.push(processNodeAsync(node, pos));
      return true;
    });
    infoPromises.push(processNodeAsync(doc, -1));

    const info: InfoEntries[] = [];
    for (const infoProm of infoPromises) {
      if (!abortSignal.aborted) {
        // Await promises serially to avoid Promise.all from running too much in one go
        info.push(await infoProm);
      }
    }
    if (!abortSignal.aborted) {
      const newMaps = consolidateInfo(info);
      if (
        !this._rdfaIdMapping ||
        !this._subjectMapping ||
        !this._topLevelSubjects
      ) {
        this._rdfaIdMapping = newMaps.rdfaIdMapping;
        this._subjectMapping = newMaps.subjectMapping;
        this._topLevelSubjects = newMaps.topLevelSubjects;
      }
      return newMaps;
    } else {
      throw abortSignal.throwIfAborted();
    }
  }

  private computeMappings() {
    const newInfo: InfoEntries[] = [];
    const { doc } = this.state;
    const importedResources = this.state.doc.attrs[IMPORTED_RESOURCES_ATTR] as
      | string[]
      | undefined;
    if (importedResources) {
      // This document defines additional external resources that can be used in RDFa relationships,
      // such as when editing a snippet. Add those resources to those available in the document.
      importedResources.forEach((imported) => {
        newInfo.push({
          subjectMapping: [
            imported,
            {
              pos: -1,
              value: doc,
            },
          ],
        });
      });
    }
    doc.descendants((node, pos) => {
      newInfo.push(processNode(node, pos));
      return true;
    });
    newInfo.push(processNode(doc, -1));
    const newMaps = consolidateInfo(newInfo);
    this._rdfaIdMapping = newMaps.rdfaIdMapping;
    this._subjectMapping = newMaps.subjectMapping;
    this._topLevelSubjects = newMaps.topLevelSubjects;
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

  get topLevelSubjects() {
    if (!this._topLevelSubjects) {
      this.computeMappings();
    }
    return unwrap(this._topLevelSubjects);
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
