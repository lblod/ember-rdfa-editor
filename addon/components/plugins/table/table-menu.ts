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
  mergeCells,
  splitCell,
  toggleHeader,
} from 'prosemirror-tables';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { insertTable } from '@lblod/ember-rdfa-editor/plugins/table';

interface Args {
  controller?: SayController;
}

const DEFAULT_COLUMNS_ROWS = 2;

export default class TableMenu extends Component<Args> {
  @tracked tableAddRows = DEFAULT_COLUMNS_ROWS;
  @tracked tableAddColumns = DEFAULT_COLUMNS_ROWS;

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

  normalizeNumber(value?: string | number) {
    if (!value) {
      return DEFAULT_COLUMNS_ROWS;
    }

    const numberValue = Number(value);

    if (isNaN(numberValue)) {
      return DEFAULT_COLUMNS_ROWS;
    }

    if (numberValue < 1) {
      return 1;
    }

    return Math.floor(numberValue);
  }

  @action
  insertTable(rows?: string | number, columns?: string | number) {
    return this.controller?.doCommand(
      insertTable(this.normalizeNumber(rows), this.normalizeNumber(columns)),
    );
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
  mergeCells() {
    this.controller?.focus();
    this.controller?.doCommand(mergeCells);
  }

  @action
  splitCell() {
    this.controller?.focus();
    this.controller?.doCommand(splitCell);
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
