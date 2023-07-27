import { Command } from 'prosemirror-state';

import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { PNode } from '@lblod/ember-rdfa-editor';
import { DERIVED_FROM_PARAGRAPH } from '@lblod/ember-rdfa-editor/nodes';

export function insertTable(rows: number, columns: number): Command {
  return (state, dispatch) => {
    const {
      schema,
      selection: { $from, $to },
    } = state;

    const parent = $from.parent;

    /**
     * `paragraph` has the content of `inline`, so we can't insert a table to
     * be content of a `paragraph`, but, if we ask `prosemirror` to do that for us,
     * the `paragraph` will be split, and the table will be inserted in between.
     */
    const isInParagraph =
      parent.type.spec.derivedFrom === DERIVED_FROM_PARAGRAPH &&
      $from.sameParent($to);

    /**
     * Does the parent allow inserting a table node, based on
     * the content match of the parent node.
     */
    const index = $from.index();
    const contentMatch = parent.contentMatchAt(index);
    const canInsertTable = contentMatch.matchType(schema.nodes.table);

    if (!isInParagraph && !canInsertTable) return false;

    const tableContent: PNode[] = [];

    for (let r = 0; r < rows; r++) {
      const cells = [];
      for (let c = 0; c < columns; c++) {
        cells.push(unwrap(schema.nodes.table_cell.createAndFill()));
      }

      tableContent.push(schema.node('table_row', null, cells));
    }

    if (dispatch) {
      const tr = state.tr;

      dispatch(
        tr
          .replaceSelectionWith(schema.node('table', null, tableContent))
          .scrollIntoView(),
      );
    }

    return true;
  };
}
