import { unwrap } from '#root/utils/_private/option.ts';
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
} from '@say-editor/prosemirror-tables';
import { findNextCell, selectionCell } from './utils.ts';
import { constructInlineStyles } from '#root/utils/_private/html-utils.ts';

export { tableNodes } from './nodes/table.ts';
export { insertTable } from './commands/insertTable.ts';

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
    const nodeClasses = node.attrs['class'] as string;
    const style = node.attrs['style'] as Record<string, string | undefined>;
    this.table.classList.add(...nodeClasses.split(' '));
    this.table.style.cssText = `${this.table.style.cssText} ${constructInlineStyles(style)}`;
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
