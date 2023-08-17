import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { keymap } from 'prosemirror-keymap';
import { NodeSelection, Plugin, TextSelection } from 'prosemirror-state';

import {
  addRow,
  CellSelection,
  goToNextCell,
  isInTable,
  moveCellForward,
  selectedRect,
  tableEditing,
} from 'prosemirror-tables';
import { findNextCell, selectionCell } from './utils';

export { tableNodes } from './nodes/table';
export { insertTable } from './commands/insertTable';

export const tablePlugin: Plugin = tableEditing({
  allowTableNodeSelection: true,
});

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
