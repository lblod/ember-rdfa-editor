import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  deepEqualProperty,
  getBacklinks,
  getProperties,
  isLinkToNode,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { Command, Transaction } from 'prosemirror-state';

type RemovePropertyArgs = {
  /** The resource from which to remove a property */
  resource: string;
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
} & (
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
  resource,
  transaction,
  ...args
}: RemovePropertyArgs): Command {
  return (state, dispatch) => {
    const resourceNodes = getNodesByResource(state, resource);
    if (!resourceNodes?.length) {
      return false;
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
      const updatedProperties = properties.slice();
      updatedProperties.splice(index, 1);

      const tr = transaction ?? state.tr;
      // Update the properties of all nodes defining the given resource
      resourceNodes.forEach((node) => {
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'properties',
          updatedProperties,
        );
      });

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
          targets = getNodesByResource(state, object.value);
        }
        targets?.forEach((target) => {
          const backlinks = getBacklinks(target.value);
          if (backlinks) {
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
