import {
  getNodeByRdfaId,
  getNodesBySubject,
} from '#root/plugins/rdfa-info/index.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import {
  deepEqualProperty,
  getBacklinks,
  getProperties,
  isLinkToNode,
} from '#root/utils/rdfa-utils.ts';
import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';
import type { Command, Transaction } from 'prosemirror-state';
import type { PNode } from '#root/prosemirror-aliases.ts';

export type RemovePropertyArgs = (
  | {
      /** The resource from which to remove a property */
      resource: string;
    }
  | {
      /** A document which defines imported resources and their properties */
      documentResourceNode: PNode;
      /** The resources imported by that document */
      importedResources: string[];
    }
) &
  (
    | {
        /** The index of the property to be removed in the properties-array of the resource */
        index: number;
      }
    | {
        /** The exact property object to find and remove */
        property: OutgoingTriple;
      }
  );

export function removeProperty({
  transaction,
  ...args
}: {
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
} & RemovePropertyArgs): Command {
  return (state, dispatch) => {
    let resource: string | undefined;
    let resourceNodes: ResolvedPNode[];
    if ('resource' in args) {
      resource = args.resource;
      resourceNodes = getNodesBySubject(state, args.resource);
      if (!resourceNodes?.length) {
        return false;
      }
    } else {
      resourceNodes = [{ value: args.documentResourceNode, pos: -1 }];
    }

    const properties = getProperties(resourceNodes[0].value);
    let propertyToRemove: OutgoingTriple | undefined;
    let index = -1;
    if ('index' in args) {
      propertyToRemove = properties?.[args.index];
      index = args.index;
    } else {
      index =
        properties?.findIndex((prop) =>
          deepEqualProperty(prop, args.property),
        ) ?? -1;
      propertyToRemove = properties?.[index];
    }
    if (!propertyToRemove || !properties) {
      return false;
    }

    if (dispatch) {
      const tr = transaction ?? state.tr;

      // First update the properties of all nodes defining the given resource
      const updatedProperties = properties.slice();
      updatedProperties.splice(index, 1);
      resourceNodes.forEach((node) => {
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'properties',
          updatedProperties,
        );
      });

      // Then we remove any backlinks.
      if (isLinkToNode(propertyToRemove)) {
        const { object } = propertyToRemove;
        /**
         * We need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        let targets: ResolvedPNode[] | undefined;
        if (object.termType === 'LiteralNode') {
          const target = getNodeByRdfaId(state, object.value);
          if (target) {
            targets = [target];
          }
        } else {
          targets = getNodesBySubject(state, object.value);
        }
        targets?.forEach((target) => {
          const backlinks = getBacklinks(target.value);
          if (backlinks) {
            if (!resource) {
              const backlink = backlinks.find(
                (bl) =>
                  bl.predicate === propertyToRemove?.predicate &&
                  'importedResources' in args &&
                  args.importedResources.includes(bl.subject.value),
              );
              resource = backlink?.subject.value;
            }
            const filteredBacklinks = backlinks.filter((backlink) => {
              return !(
                backlink.predicate === propertyToRemove?.predicate &&
                backlink.subject.value === resource
              );
            });
            TransformUtils.setAttribute(
              tr,
              target.pos,
              'backlinks',
              filteredBacklinks,
            );
          }
        });
      }

      dispatch(tr);
    }

    return true;
  };
}
