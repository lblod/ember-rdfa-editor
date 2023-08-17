import { Command } from 'prosemirror-state';

import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { PNode } from '@lblod/ember-rdfa-editor';

export function insertTable(rows: number, columns: number): Command {
  return (state, dispatch) => {
    const {
      schema,
      selection: { $from },
    } = state;

    const specAllowSplitByTable = $from.parent.type.spec.allowSplitByTable as
      | boolean
      | undefined;

    const allowSplitByTable: boolean =
      specAllowSplitByTable === undefined ? true : specAllowSplitByTable;

    if (!allowSplitByTable) return false;

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
