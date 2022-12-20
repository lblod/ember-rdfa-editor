import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
} from 'prosemirror-tables';
import { PNode } from '@lblod/ember-rdfa-editor';

interface Args {
  controller: ProseController;
}

export default class TableMenu extends Component<Args> {
  @tracked tableAddRows = 2;
  @tracked tableAddColumns = 2;

  // Table commands
  get controller(): ProseController {
    return this.args.controller;
  }

  get isInTable() {
    return this.controller.checkCommand(deleteTable);
  }

  @action
  insertTable(rows: number, columns: number) {
    const { schema } = this.controller;
    const tableContent: PNode[] = [];
    for (let r = 0; r < rows; r++) {
      const cells = [];
      for (let c = 0; c < columns; c++) {
        cells.push(schema.node('table_cell', null, []));
      }
      tableContent.push(schema.node('table_row', null, cells));
    }
    this.controller.withTransaction((tr) => {
      return tr
        .replaceSelectionWith(
          this.controller.schema.node('table', null, tableContent)
        )
        .scrollIntoView();
    });
  }

  @action
  insertRowBelow() {
    this.controller.focus();
    this.controller.doCommand(addRowAfter);
  }

  @action
  insertRowAbove() {
    this.controller.focus();
    this.controller.doCommand(addRowBefore);
  }

  @action
  insertColumnAfter() {
    this.controller.focus();
    this.controller.doCommand(addColumnAfter);
  }

  @action
  insertColumnBefore() {
    this.controller.focus();
    this.controller.doCommand(addColumnBefore);
  }

  @action
  removeTableRow() {
    this.controller.focus();
    this.controller.doCommand(deleteRow);
  }

  @action
  removeTableColumn() {
    this.controller.focus();
    this.controller.doCommand(deleteColumn);
  }

  @action
  removeTable() {
    this.controller.focus();
    this.controller.doCommand(deleteTable);
  }
}
