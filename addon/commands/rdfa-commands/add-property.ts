import type { Command, Transaction } from 'prosemirror-state';
import type {
  IncomingTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  languageOrDataType,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  getNodeByRdfaId,
  getNodesBySubject,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getProperties,
  isLinkToNode,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources';

export type AddPropertyArgs = {
  /** The resource to which to add a property */
  resource: string;
  /** Property to add */
  property: OutgoingTriple;
  /**
    A transaction to use in place of getting a new one from state.tr
    This can be used to call this command from within another, but care must be taken to not use
    the passed transaction between passing it in and when the callback is called.
  */
  transaction?: Transaction;
  /**
   * Flag indicating if this resource represents a new imported resource on the document
   */
  isNewImportedResource?: boolean;
};

export function addProperty({
  resource,
  property,
  transaction,
  isNewImportedResource,
}: AddPropertyArgs): Command {
  return (state, dispatch) => {
    let resourceNodes = getNodesBySubject(state, resource);
    if (!resourceNodes?.length && !isNewImportedResource) {
      return false;
    }

    if (dispatch) {
      const tr = transaction ?? state.tr;
      if (isNewImportedResource) {
        const imported: string[] = state.doc.attrs[IMPORTED_RESOURCES_ATTR];
        tr.setDocAttribute(IMPORTED_RESOURCES_ATTR, [...imported, resource]);
        resourceNodes = [{ pos: -1, value: state.doc }];
      }
      const properties = getProperties(resourceNodes[0].value);
      const updatedProperties = properties
        ? [...properties, property]
        : [property];

      // Update the properties of each node that defines the given resource
      resourceNodes.forEach((node) => {
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'properties',
          updatedProperties,
        );
      });

      if (isLinkToNode(property)) {
        const { object } = property;
        let targets: ResolvedPNode[] | undefined;
        /**
         * We need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        let newBacklink: IncomingTriple;
        if (object.termType === 'LiteralNode') {
          newBacklink = {
            subject: sayDataFactory.literalNode(
              resource,
              languageOrDataType(object.language, object.datatype),
            ),
            predicate: property.predicate,
          };
          const target = getNodeByRdfaId(state, object.value);
          if (target) {
            targets = [target];
          }
        } else {
          newBacklink = {
            subject: sayDataFactory.resourceNode(resource),
            predicate: property.predicate,
          };
          targets = getNodesBySubject(state, object.value);
        }
        targets?.forEach((target) => {
          const backlinks = target.value.attrs['backlinks'] as
            | IncomingTriple[]
            | undefined;
          const newBacklinks = backlinks
            ? [...backlinks, newBacklink]
            : [newBacklink];
          TransformUtils.setAttribute(
            tr,
            target.pos,
            'backlinks',
            newBacklinks,
          );
        });
      }
      dispatch(tr);
    }
    return true;
  };
}
