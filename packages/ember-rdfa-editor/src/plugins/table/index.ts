import { unwrap } from '#root/utils/_private/option.ts';
import { keymap } from 'prosemirror-keymap';
import { NodeSelection, Plugin, TextSelection } from 'prosemirror-state';
import { TableView } from './table-view.ts';

import {
  addRow,
  type CellSelection,
  columnResizing,
  goToNextCell,
  isInTable,
  moveCellForward,
  selectedRect,
  tableEditing,
} from '@say-editor/prosemirror-tables';
import { findNextCell, selectionCell } from './utils.ts';

export { tableNodes } from './nodes/table.ts';
export { insertTable } from './commands/insertTable.ts';
export { TableView } from './table-view.ts';

export const tablePlugin: Plugin = tableEditing({
  allowTableNodeSelection: true,
});

export const tableColumnResizingPlugin: Plugin = columnResizing({
  View: TableView,
  lastColumnResizable: false,
});

export const tablePlugins: Plugin[] = [tableColumnResizingPlugin, tablePlugin];

export const tableKeymap = keymap({
  Tab: (state, dispatch) => {
    if (!isInTable(state)) {
      return false;
    }
    if (dispatch) {
      let transaction = state.tr;
      let cell = findNextCell(
        unwrap(selectionCell(state.selection as CellSelection | NodeSelection)),
        1,
      );
      if (!cell) {
        const rect = selectedRect(state);
        transaction = addRow(transaction, rect, rect.bottom);
        cell = unwrap(
          findNextCell(
            unwrap(
              selectionCell(
                transaction.selection as CellSelection | NodeSelection,
              ),
            ),
            1,
          ),
        );
      }
      const $cell = transaction.doc.resolve(cell);
      dispatch(
        transaction
          .setSelection(TextSelection.between($cell, moveCellForward($cell)))
          .scrollIntoView(),
      );
    }
    return true;
  },
  'Shift-Tab': goToNextCell(-1),
});
