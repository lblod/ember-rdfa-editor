import { EditorState, Plugin } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/_private/node-utils';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import type {
  Backlink,
  Property,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';

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
        Array<{ property: Property; resource: string }>
      >();

      const targetsWithProperties = new Map<
        ResolvedPNode,
        Array<{ backlink: Backlink; rdfaId?: string }>
      >();

      deletedNodes.forEach((node) => {
        const isResource = isResourceNode(node);

        if (isResource) {
          const resource = node.attrs.resource as string;
          const resourceNodes = getNodesByResource(newState, resource);

          if (resourceNodes && resourceNodes.length >= 1) {
            return;
          }

          const properties = getProperties(node) ?? [];

          properties.forEach((property) => {
            if (property.type === 'external') {
              const { object } = property;

              if (object.type === 'literal') {
                const node = getNodeByRdfaId(newState, object.rdfaId);

                if (node) {
                  setOrPush(targetsWithBacklinks, node, { property, resource });
                }
              } else {
                const nodes = getNodesByResource(newState, object.resource);

                nodes?.forEach((node) => {
                  setOrPush(targetsWithBacklinks, node, { property, resource });
                });
              }
            }
          });

          const backlinks = getBacklinks(node) ?? [];

          backlinks.forEach((backlink) => {
            const subject = backlink.subject;
            const nodes = getNodesByResource(newState, subject);

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
            const nodes = getNodesByResource(newState, subject);

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
                  backlink.subject === meta.resource,
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
                  if (property.type !== 'external') {
                    return false;
                  }

                  if (property.object.type !== 'literal') {
                    return false;
                  }

                  if (property.object.rdfaId !== rdfaId) {
                    return false;
                  }
                }

                return (
                  backlink.predicate === property.predicate &&
                  backlink.subject === getResource(target.value)
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
