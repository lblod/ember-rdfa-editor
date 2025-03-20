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
} from '@say-editor/prosemirror-tables';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';
import { insertTable } from '@lblod/ember-rdfa-editor/plugins/table/index.ts';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { TableIcon } from '@appuniversum/ember-appuniversum/components/icons/table';
import { TableInsertIcon } from '@appuniversum/ember-appuniversum/components/icons/table-insert';
import { TableColumnEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-end-add';
import { TableColumnStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-start-add';
import { TableColumnRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-remove';
import { TableRowEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-end-add';
import { TableRowStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-start-add';
import { TableRowRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-remove';
import type { Command } from 'prosemirror-state';

interface Args {
  controller?: SayController;
}

const DEFAULT_COLUMNS_ROWS = 2;

type Action = {
  title: string;
  command: Command;
  icon?: string;
};

export default class TableMenu extends Component<Args> {
  TableIcon = TableIcon;
  TableInsertIcon = TableInsertIcon;
  TableColumnEndAddIcon = TableColumnEndAddIcon;
  TableRowEndAddIcon = TableRowEndAddIcon;

  @service declare intl: IntlService;

  @tracked tableAddRows = DEFAULT_COLUMNS_ROWS;
  @tracked tableAddColumns = DEFAULT_COLUMNS_ROWS;

  get tableActions() {
    return [
      {
        command: addRowAfter,
        title: this.intl.t('ember-rdfa-editor.table.add-row-below'),
        icon: TableRowEndAddIcon,
      },
      {
        command: addRowBefore,
        title: this.intl.t('ember-rdfa-editor.table.add-row-above'),
        icon: TableRowStartAddIcon,
      },
      {
        command: addColumnAfter,
        title: this.intl.t('ember-rdfa-editor.table.add-column-after'),
        icon: TableColumnEndAddIcon,
      },
      {
        command: addColumnBefore,
        title: this.intl.t('ember-rdfa-editor.table.add-column-before'),
        icon: TableColumnStartAddIcon,
      },
      {
        command: deleteRow,
        title: this.intl.t('ember-rdfa-editor.table.delete-row'),
        icon: TableRowRemoveIcon,
      },
      {
        command: deleteColumn,
        title: this.intl.t('ember-rdfa-editor.table.delete-column'),
        icon: TableColumnRemoveIcon,
      },
      {
        command: deleteTable,
        title: this.intl.t('ember-rdfa-editor.table.delete-table'),
        icon: BinIcon,
      },
      {
        command: toggleHeader('row'),
        title: this.intl.t('ember-rdfa-editor.table.toggle-header-row'),
      },
      {
        command: toggleHeader('column'),
        title: this.intl.t('ember-rdfa-editor.table.toggle-header-column'),
      },
      {
        command: mergeCells,
        title: this.intl.t('ember-rdfa-editor.table.merge-cells'),
      },
      {
        command: splitCell,
        title: this.intl.t('ember-rdfa-editor.table.split-cell'),
      },
    ];
  }

  canExecuteAction = (action: Action): boolean => {
    return !!this.controller?.checkCommand(action.command);
  };

  executeAction = (action: Action) => {
    this.controller?.focus();
    this.controller?.doCommand(action.command);
  };

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
  insertColumnAfter() {
    this.controller?.focus();
    this.controller?.doCommand(addColumnAfter);
  }
}
