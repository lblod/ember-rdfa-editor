import type { Command } from 'prosemirror-state';

import { unwrap } from '#root/utils/_private/option.ts';
import { PNode } from '#root/prosemirror-aliases.ts';

export function insertTable(rows: number, columns: number): Command {
  return (state, dispatch) => {
    const {
      schema,
      selection: { $from },
    } = state;

    // table nodespecs don't necessarily exist, for example in an embedded editor or if
    // misconfigured
    if (
      ['table', 'table_row', 'table_header', 'table_cell'].some(
        (nodeType) => !schema.nodes[nodeType],
      )
    ) {
      return false;
    }

    const specAllowSplitByTable = $from.parent.type.spec[
      'allowSplitByTable'
    ] as boolean | undefined;

    const allowSplitByTable: boolean =
      specAllowSplitByTable === undefined ? true : specAllowSplitByTable;

    if (!allowSplitByTable) return false;

    const tableContent: PNode[] = [];

    for (let r = 0; r < rows; r++) {
      const cells = [];
      const proportionalWidth = 100 / columns;

      for (let c = 0; c < columns; c++) {
        cells.push(
          unwrap(
            schema.nodes['table_cell'].createAndFill(
              proportionalWidth
                ? {
                    colwidth: [proportionalWidth],
                  }
                : undefined,
            ),
          ),
        );
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
