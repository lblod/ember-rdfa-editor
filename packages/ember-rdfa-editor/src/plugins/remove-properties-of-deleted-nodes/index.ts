import { EditorState, Plugin } from 'prosemirror-state';
import { PNode } from '#root/prosemirror-aliases.ts';
import {
  getNodeByRdfaId,
  getNodesBySubject,
} from '#root/plugins/rdfa-info/index.ts';
import { isResourceNode } from '#root/utils/_private/node-utils.ts';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
  getSubject,
  isLinkToNode,
} from '#root/utils/_private/rdfa-utils.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type {
  IncomingTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';

/**
 * Returns nodes from the oldState that are not in the newState
 */
function getDeletedNodes(oldState: EditorState, newState: EditorState) {
  const prevNodesById: Map<string, PNode> = new Map();
  const nextNodesById: Map<string, PNode> = new Map();

  oldState.doc.descendants((node) => {
    if (node.attrs['__rdfaId']) {
      prevNodesById.set(node.attrs['__rdfaId'] as string, node);
    }
  });

  newState.doc.descendants((node) => {
    if (node.attrs['__rdfaId']) {
      nextNodesById.set(node.attrs['__rdfaId'] as string, node);
    }
  });

  // nodes that are in oldState but not in newState
  const deletedNodes = new Set<PNode>();

  prevNodesById.forEach((node, rdfaId) => {
    if (!nextNodesById.has(rdfaId)) {
      deletedNodes.add(node);
    }
  });

  return deletedNodes;
}

const setOrPush = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
  if (!map.has(key)) {
    map.set(key, []);
  }

  const existing = map.get(key);

  if (existing) {
    existing.push(value);
  }
};

export function removePropertiesOfDeletedNodes() {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      if (!transactions.some((transaction) => transaction.docChanged)) {
        return null;
      }

      const deletedNodes = getDeletedNodes(oldState, newState);

      if (deletedNodes.size === 0) {
        return null;
      }

      const targetsWithBacklinks = new Map<
        ResolvedPNode,
        Array<{ property: OutgoingTriple; resource: string }>
      >();

      const targetsWithProperties = new Map<
        ResolvedPNode,
        Array<{ backlink: IncomingTriple; rdfaId?: string }>
      >();

      deletedNodes.forEach((node) => {
        const isResource = isResourceNode(node);

        if (isResource) {
          const subject = node.attrs['subject'] as string;
          const resourceNodes = getNodesBySubject(newState, subject);

          if (resourceNodes && resourceNodes.length >= 1) {
            return;
          }

          const properties = getProperties(node) ?? [];

          properties.forEach((property) => {
            if (isLinkToNode(property)) {
              const { object } = property;

              if (object.termType === 'LiteralNode') {
                const node = getNodeByRdfaId(newState, object.value);

                if (node) {
                  setOrPush(targetsWithBacklinks, node, {
                    property,
                    resource: subject,
                  });
                }
              } else {
                const nodes = getNodesBySubject(newState, object.value);

                nodes?.forEach((node) => {
                  setOrPush(targetsWithBacklinks, node, {
                    property,
                    resource: subject,
                  });
                });
              }
            }
          });

          const backlinks = getBacklinks(node) ?? [];

          backlinks.forEach((backlink) => {
            const subject = backlink.subject;
            const nodes = getNodesBySubject(newState, subject.value);

            nodes?.forEach((node) => {
              setOrPush(targetsWithProperties, node, {
                backlink,
              });
            });
          });
        }

        const rdfaId = getRdfaId(node);

        if (!isResource && rdfaId) {
          const backlinks = getBacklinks(node) ?? [];

          backlinks.forEach((backlink) => {
            const subject = backlink.subject;
            const nodes = getNodesBySubject(newState, subject.value);

            nodes?.forEach((node) => {
              setOrPush(targetsWithProperties, node, {
                backlink,
                rdfaId,
              });
            });
          });
        }
      });

      if (targetsWithBacklinks.size === 0 && targetsWithProperties.size === 0) {
        return null;
      }

      const tr = newState.tr;

      targetsWithBacklinks.forEach((meta, target) => {
        const backlinks = getBacklinks(target.value);

        if (backlinks) {
          const filteredBacklinks = backlinks.filter(
            (backlink) =>
              !meta.some(
                (meta) =>
                  backlink.predicate === meta.property.predicate &&
                  backlink.subject.value === meta.resource,
              ),
          );
          TransformUtils.setAttribute(
            tr,
            target.pos,
            'backlinks',
            filteredBacklinks,
          );
        }
      });

      targetsWithProperties.forEach((meta, target) => {
        const properties = getProperties(target.value);

        if (properties) {
          const filteredProperties = properties.filter(
            (property) =>
              !meta.some(({ backlink, rdfaId }) => {
                if (rdfaId) {
                  if (!isLinkToNode(property)) {
                    return false;
                  }

                  if (property.object.termType !== 'LiteralNode') {
                    return false;
                  }

                  if (property.object.value !== rdfaId) {
                    return false;
                  }
                }

                return (
                  backlink.predicate === property.predicate &&
                  backlink.subject.value === getSubject(target.value)
                );
              }),
          );
          TransformUtils.setAttribute(
            tr,
            target.pos,
            'properties',
            filteredProperties,
          );
        }
      });

      return tr.steps.length ? tr : null;
    },
  });
}
