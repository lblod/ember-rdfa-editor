import type {
  IncomingTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import { getSubject } from '#root/plugins/rdfa-info/plugin.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';
import type { EditorState } from 'prosemirror-state';
import type {
  TransactionMonad,
  TransactionMonadResult,
} from '../transaction-utils.ts';
import {
  addBacklink,
  addProperty,
  getNodeByRdfaId,
  getNodesBySubject,
} from '#root/plugins/rdfa-info/utils.ts';
import { isRdfaAttrs } from '#root/core/schema.ts';
import TransformUtils from './transform-utils.ts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';

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

export type AddBacklinkToNodeArgs = {
  /** The resource to which to add a property */
  rdfaId: string;
  /** Property to add */
  backlink: IncomingTriple;
};
export function addBacklinkToNode({
  rdfaId,
  backlink,
}: AddBacklinkToNodeArgs): TransactionMonad<boolean> {
  return function (state: EditorState): TransactionMonadResult<boolean> {
    const doNothing = {
      initialState: state,
      transaction: state.tr,
      result: false,
    };
    const node = getNodeByRdfaId(state, rdfaId);
    if (!node || !isRdfaAttrs(node.value.attrs)) {
      return doNothing;
    }
    const attrs = node.value.attrs;
    const nodesToUpdate =
      attrs.rdfaNodeType === 'resource'
        ? getNodesBySubject(state, attrs.subject)
        : [node];

    const backlinks = node.value.attrs.backlinks;
    const updatedBacklinks = addBacklink(backlinks, backlink);

    const tr = state.tr;
    nodesToUpdate.forEach((node) => {
      TransformUtils.setAttribute(tr, node.pos, 'backlinks', updatedBacklinks);
    });
    const subjectNodes = getNodesBySubject(state, backlink.subject.value);
    if (subjectNodes.length) {
      const newProperty: OutgoingTriple =
        attrs.rdfaNodeType === 'resource'
          ? {
              predicate: backlink.predicate,
              object: sayDataFactory.resourceNode(attrs.subject),
            }
          : {
              predicate: backlink.predicate,
              object: sayDataFactory.literalNode(attrs.__rdfaId),
            };
      const properties = subjectNodes[0].value.attrs[
        'properties'
      ] as OutgoingTriple[];
      const updatedProperties = addProperty(properties, newProperty);
      subjectNodes.forEach((node) => {
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'properties',
          updatedProperties,
        );
      });
    }
    return { initialState: state, transaction: tr, result: true };
  };
}
