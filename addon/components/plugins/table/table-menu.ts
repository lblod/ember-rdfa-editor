import Component from '@glimmer/component';
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
  toggleHeader,
} from 'prosemirror-tables';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { insertTable } from '@lblod/ember-rdfa-editor/plugins/table';

interface Args {
  controller?: SayController;
}

export default class TableMenu extends Component<Args> {
  @tracked tableAddRows = 2;
  @tracked tableAddColumns = 2;

  // Table commands
  get controller(): SayController | undefined {
    return this.args.controller;
  }

  get isInTable() {
    return this.controller?.checkCommand(deleteTable);
  }

  get canInsertTable() {
    if (this.controller?.inEmbeddedView) {
      return false;
    }

    return this.controller?.checkCommand(insertTable(1, 1));
  }

  @action
  insertTable(rows: number, columns: number) {
    return this.controller?.doCommand(insertTable(rows, columns));
  }

  @action
  insertRowBelow() {
    this.controller?.focus();
    this.controller?.doCommand(addRowAfter);
  }

  @action
  insertRowAbove() {
    this.controller?.focus();
    this.controller?.doCommand(addRowBefore);
  }

  @action
  insertColumnAfter() {
    this.controller?.focus();
    this.controller?.doCommand(addColumnAfter);
  }

  @action
  insertColumnBefore() {
    this.controller?.focus();
    this.controller?.doCommand(addColumnBefore);
  }

  @action
  removeTableRow() {
    this.controller?.focus();
    this.controller?.doCommand(deleteRow);
  }

  @action
  removeTableColumn() {
    this.controller?.focus();
    this.controller?.doCommand(deleteColumn);
  }

  @action
  removeTable() {
    this.controller?.focus();
    this.controller?.doCommand(deleteTable);
  }

  @action
  toggleHeaderRow() {
    this.controller?.focus();
    this.controller?.doCommand(toggleHeader('row'));
  }

  @action
  toggleHeaderColumn() {
    this.controller?.focus();
    this.controller?.doCommand(toggleHeader('column'));
  }
}
