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
import SayController from '#root/core/say-controller.ts';
import { insertTable } from '#root/plugins/table/index.ts';
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
import ToolbarDropdown from '#root/components/toolbar/dropdown.gts';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import { fn } from '@ember/helper';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { Input } from '@ember/component';
import type { ComponentLike } from '@glint/template';

interface Args {
  controller?: SayController;
}

const DEFAULT_COLUMNS_ROWS = 2;

type Action = {
  title: string;
  command: Command;
  icon?: ComponentLike;
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

  numToString(num: number) {
    return num.toString(10);
  }
  <template>
    <ToolbarDropdown
      @controller={{@controller}}
      @icon={{this.TableIcon}}
      @label={{t "ember-rdfa-editor.table.table-options"}}
      title={{t "ember-rdfa-editor.table.table-options"}}
      @hideLabel={{true}}
      @disabled={{not this.canInsertTable}}
      as |Menu|
    >
      {{#if this.isInTable}}
        {{#each this.tableActions as |action|}}
          <Menu.Item
            @menuAction={{fn this.executeAction action}}
            title={{action.title}}
            disabled={{not (this.canExecuteAction action)}}
          >
            {{#if action.icon}}
              <AuIcon @icon={{action.icon}} @ariaHidden={{true}} />
            {{/if}}
            {{action.title}}
          </Menu.Item>
        {{/each}}
      {{else}}
        <div role="group">
          <div role="menuitem" class="say-dropdown__menu-with-inputs">
            {{t "ember-rdfa-editor.table.columns"}}
            <AuLabel for="editor-table-columns" class="au-u-hidden-visually">{{t
                "ember-rdfa-editor.table.columns"
              }}</AuLabel>
            {{! TODO Refactor to use native input }}
            {{! template-lint-disable no-builtin-form-components }}
            <Input
              id="editor-table-columns"
              class="say-input say-input--small"
              size="1"
              @value={{this.numToString this.tableAddColumns}}
            />
          </div>
        </div>
        <div role="group">
          <div role="menuitem" class="say-dropdown__menu-with-inputs">
            {{t "ember-rdfa-editor.table.rows"}}
            <AuLabel for="editor-table-rows" class="au-u-hidden-visually">{{t
                "ember-rdfa-editor.table.rows"
              }}</AuLabel>
            {{! TODO Refactor to use native input }}
            {{! template-lint-disable no-builtin-form-components }}
            <Input
              id="editor-table-rows"
              class="say-input say-input--small"
              size="1"
              @value={{this.numToString this.tableAddRows}}
            />
          </div>
        </div>
        <Menu.Item
          @menuAction={{fn
            this.insertTable
            this.tableAddRows
            this.tableAddColumns
          }}
          title={{t "ember-rdfa-editor.table.insert-table"}}
        >
          <AuIcon @icon={{this.TableInsertIcon}} @ariaHidden={{true}} />
          {{t "ember-rdfa-editor.table.insert-table"}}
        </Menu.Item>
      {{/if}}
    </ToolbarDropdown>
  </template>
}
