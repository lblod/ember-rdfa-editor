import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  findNodeByRdfaId,
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import {
  AddPropertyArgs,
  addProperty,
} from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property';
import { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

type InsertRelationArgs = {
  /** The position of the node at which to add the property */
  position: number;
  type: 'content' | 'resource';
  /** The predicate describing the new relationship */
  predicate: string;
};
export function insertRelation({
  position,
  type: _type,
  predicate,
}: InsertRelationArgs): Command {
  return (state, dispatch) => {
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
        object: 'placeholder',
        nodeId: subjectId,
      },
    };
    if (!addProperty(addPropArgs)(state)) {
      return false;
    }

    if (dispatch) {
      const objectId = uuidv4();
      const createdObject = state.schema.nodes.block_rdfa.create(
        { __rdfaId: objectId },
        state.schema.text(predicate),
      );
      // Replace the placeholder
      addPropArgs.property.object = objectId;

      const addPropStatus = addProperty(addPropArgs)(state, (tr) => {
        tr.replaceSelectionWith(createdObject).scrollIntoView();

        dispatch(tr);
      });

      return addPropStatus;
    }
    return true;
  };
}
