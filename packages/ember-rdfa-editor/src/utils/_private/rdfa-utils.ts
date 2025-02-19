import { getSubject } from '#root/plugins/rdfa-info/plugin.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';

export {
  addPropertyToNode,
  addBacklink,
  addProperty,
  calculateRdfaPrefixes,
  deepEqualBacklink,
  deepEqualProperty,
  findNodeByRdfaId,
  findNodesBySubject,
  findRdfaIdsInSelection,
  generateNewUri,
  getBacklinks,
  getNodeByRdfaId,
  getNodesBySubject,
  getProperties,
  getRdfaAttribute,
  getRdfaChildren,
  getRdfaIds,
  isLinkToNode,
  mapPositionFrom,
  parsePrefixString,
  removePropertyFromNode,
} from '#root/plugins/rdfa-info/utils.ts';
export { getRdfaId, getSubject } from '#root/plugins/rdfa-info/plugin.ts';
/**
 * Calculates a set of subject attributes present in the provided node and its children
 */
export function getSubjects(node: PNode): Set<string> {
  const result = new Set<string>();
  const subject = getSubject(node);
  if (subject) {
    result.add(subject);
  }
  node.descendants((child) => {
    const subject = getSubject(child);
    if (subject) {
      result.add(subject);
    }
    return true;
  });
  return result;
}
