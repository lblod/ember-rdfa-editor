import { getRdfaId } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import {
  AddPropertyArgs,
  addProperty,
} from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property';
import { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import { OutgoingNodeProp } from '@lblod/ember-rdfa-editor/core/say-parser';

export type InsertRelationDetails = {
  /** The predicate describing the new relationship */
  predicate: string;
} & ({ type: 'content' } | { type: 'resource'; uriBase: string });
type InsertRelationArgs = {
  /** The position of the node at which to add the property */
  position: number;
} & InsertRelationDetails;

export function insertRelation(args: InsertRelationArgs): Command {
  return (state, dispatch) => {
    const { position, type, predicate } = args;
    const node = state.doc.nodeAt(position);

    if (!node) {
      return false;
    }
    const subjectId = getRdfaId(node);
    if (!subjectId) {
      return false;
    }

    const addPropArgs: AddPropertyArgs = {
      position,
      property: {
        type: 'node',
        predicate,
        // Use a placeholder for applicability checks (i.e. !dispatcher)
        object: predicate,
        nodeId: 'placeholder',
      },
    };
    if (!addProperty(addPropArgs)(state)) {
      return false;
    }

    if (dispatch) {
      const objectId = uuidv4();
      const additionalAttrs =
        type === 'resource' ? { resource: `${args.uriBase}${uuidv4()}` } : {};
      const createdObject = state.schema.nodes.block_rdfa.create(
        {
          __rdfaId: objectId,
          rdfaNodeType: type,
          ...additionalAttrs,
        },
        state.schema.node('paragraph', null, [
          state.schema.text(addPropArgs.property.object),
        ]),
      );
      // Replace the placeholder
      (addPropArgs.property as OutgoingNodeProp).nodeId = objectId;
      // Need to create the node before can call add property
      const tr = state.tr.replaceSelectionWith(createdObject).scrollIntoView();

      const addPropStatus = addProperty({ ...addPropArgs, transaction: tr })(
        state,
        (transaction) => {
          dispatch(transaction);
        },
      );

      return addPropStatus;
    }
    return true;
  };
}
