import type { EditorState } from 'prosemirror-state';
import { rdfaInfoPluginKey } from './plugin.ts';

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
