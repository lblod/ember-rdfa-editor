import { AddPropertyArgs, addProperty } from '../../rdfa-commands/add-property';
import { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

export type InsertRelationDetails = {
  /** The predicate describing the new relationship */
  predicate: string;
} & ({ type: 'literal' } | { type: 'resource'; uriBase: string });
type InsertRelationArgs = {
  /** The subject to which to add the property */
  subject: string;
} & InsertRelationDetails;

export function insertRelation(args: InsertRelationArgs): Command {
  return (state, dispatch) => {
    const { subject, type, predicate } = args;
    const addPropArgs: AddPropertyArgs = {
      resource: subject,
      property: {
        type: 'external',
        predicate,
        // Use a placeholder for applicability checks (i.e. !dispatcher)
        object: {
          type: 'literal',
          rdfaId: 'placeholder',
        },
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
          state.schema.text(addPropArgs.property.predicate),
        ]),
      );
      // Replace the placeholder
      addPropArgs.property.object = {
        type: 'literal',
        rdfaId: objectId,
      };
      // Need to create the node before can call add property
      const tr = state.tr.replaceSelectionWith(createdObject).scrollIntoView();
      // pass the state after this transaction to addProperty so the node exists
      const newState = state.apply(tr);

      const addPropStatus = addProperty({ ...addPropArgs, transaction: tr })(
        newState,
        (transaction) => {
          dispatch(transaction);
        },
      );

      return addPropStatus;
    }
    return true;
  };
}
