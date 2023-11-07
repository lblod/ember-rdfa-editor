import { AddPropertyArgs, addProperty } from './add-property';
import { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

type InsertRelationArgs = {
  /** The subject to which to add the property */
  subject: string;
  type: 'content' | 'resource';
  /** The predicate describing the new relationship */
  predicate: string;
};
export function insertRelation({
  subject,
  type: _type,
  predicate,
}: InsertRelationArgs): Command {
  return (state, dispatch) => {
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
      const createdObject = state.schema.nodes.block_rdfa.create(
        { __rdfaId: objectId },
        state.schema.nodes.paragraph.create(null, state.schema.text(predicate)),
      );
      // Replace the placeholder
      addPropArgs.property.object = {
        type: 'literal',
        rdfaId: objectId,
      };

      const addPropStatus = addProperty(addPropArgs)(state, (tr) => {
        tr.replaceSelectionWith(createdObject).scrollIntoView();

        dispatch(tr);
      });

      return addPropStatus;
    }
    return true;
  };
}
