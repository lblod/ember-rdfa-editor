import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { keymap } from 'prosemirror-keymap';
import { NodeSelection, Plugin, TextSelection } from 'prosemirror-state';
import { Node } from 'prosemirror-model';

import {
  addRow,
  CellSelection,
  columnResizing,
  goToNextCell,
  isInTable,
  moveCellForward,
  selectedRect,
  tableEditing,
  TableView as PluginTableView,
} from 'prosemirror-tables';
import { findNextCell, selectionCell } from './utils';

export { tableNodes } from './nodes/table';
export { insertTable } from './commands/insertTable';

export const tablePlugin: Plugin = tableEditing({
  allowTableNodeSelection: true,
});

export class TableView extends PluginTableView {
  constructor(
    public node: Node,
    public cellMinWidth: number,
  ) {
    super(node, cellMinWidth);
    this.addAttrs(node);
  }

  private addAttrs(node: Node): void {
    const { class: nodeClasses, style } = node.attrs as Record<string, unknown>;
    if (typeof nodeClasses === 'string') {
      this.table.classList.add(...nodeClasses.split(' '));
    }
    if (typeof style === 'string') {
      this.table.style.cssText = `${this.table.style.cssText} ${style}`;
    }
  }

  get colgroupElement(): HTMLTableColElement {
    return this.colgroup;
  }
}

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
