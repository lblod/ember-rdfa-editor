import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import SelectionTooltip from '../../_private/common/selection-tooltip.gts';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  mergeCells,
  setCellAttr,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from '@say-editor/prosemirror-tables';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import ColorMenu from '#root/components/plugins/table/color.gts';
import type { ComponentLike } from '@glint/template';
import VerticalAlign from '#root/components/plugins/table/vertical-align.gts';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { TableColumnEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-end-add';
import { TableColumnStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-start-add';
import { TableColumnRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-remove';
import { TableRowEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-end-add';
import { TableRowStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-start-add';
import { TableRowRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-remove';
import type SayController from '#root/core/say-controller.ts';
import type { Command } from 'prosemirror-state';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

type Args = {
  controller: SayController;
};

type TitledAction = {
  title: string;
  icon?: ComponentLike<{ Element: Element }>;
  label?: string;
  command: Command;
};
type ComponentAction = {
  component: ComponentLike<{ Args: { controller: SayController } }>;
};
type Action = TitledAction | ComponentAction;

function isTitledAction(action: Action): action is TitledAction {
  if ('command' in action) {
    return true;
  }
  return false;
}
export default class TableTooltip extends Component<Args> {
  @service declare intl: IntlService;

  @tracked _justClicked = false;

  htmlSafe = htmlSafe;

  setUpListeners = modifier(() => {
    const handleMouseDown = () => {
      this._justClicked = true;
    };
    const handleKeyDown = () => {
      this._justClicked = false;
    };
    const viewDom = this.controller.mainEditorView.dom;
    viewDom.addEventListener('mousedown', handleMouseDown);
    viewDom.addEventListener('keydown', handleKeyDown);
    return () => {
      viewDom.removeEventListener('mousedown', handleMouseDown);
      viewDom.removeEventListener('keydown', handleKeyDown);
    };
  });

  get tableActions(): Action[][] {
    return [
      [
        {
          title: this.intl.t('ember-rdfa-editor.table.toggle-header-row'),
          label: this.intl.t('ember-rdfa-editor.table.toggle-header-row'),
          command: toggleHeaderRow,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.toggle-header-column'),
          label: this.intl.t('ember-rdfa-editor.table.toggle-header-column'),
          command: toggleHeaderColumn,
        },
      ],
      [
        {
          title: this.intl.t('ember-rdfa-editor.table.add-row-below'),
          icon: TableRowEndAddIcon,
          command: addRowAfter,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-row-above'),
          icon: TableRowStartAddIcon,
          command: addRowBefore,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-column-after'),
          icon: TableColumnEndAddIcon,
          command: addColumnAfter,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-column-before'),
          icon: TableColumnStartAddIcon,
          command: addColumnBefore,
        },
      ],
      [
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-row'),
          icon: TableRowRemoveIcon,
          command: deleteRow,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-column'),
          icon: TableColumnRemoveIcon,
          command: deleteColumn,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-table'),
          icon: BinIcon,
          command: deleteTable,
        },
        { component: ColorMenu as unknown as ComponentLike },
        { component: VerticalAlign as unknown as ComponentLike },
      ],
      [
        {
          title: this.intl.t('ember-rdfa-editor.table.merge-cells'),
          label: this.intl.t('ember-rdfa-editor.table.merge-cells'),
          command: mergeCells,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.split-cell'),
          label: this.intl.t('ember-rdfa-editor.table.split-cell'),
          command: splitCell,
        },
      ],
    ];
  }

  get controller() {
    return this.args.controller;
  }

  get visible() {
    return this._justClicked && this.isInTable;
  }

  get isInTable() {
    return this.controller.checkCommand(deleteTable);
  }

  canExecuteAction = (action: Action) => {
    if ('command' in action) {
      return this.controller.checkCommand(action.command);
    }

    return false;
  };

  @action
  executeAction(action: Action) {
    if ('command' in action) {
      this.controller.focus();
      this.controller.doCommand(action.command);
    }

    return;
  }

  @action
  selectColor(color: string) {
    this.controller.focus();
    this.controller.doCommand(setCellAttr('background', color));
  }
  <template>
    <div {{this.setUpListeners}}>
      <SelectionTooltip
        @controller={{this.controller}}
        @visible={{this.visible}}
        class="say-table-tooltip"
      >
        {{#each this.tableActions as |row|}}
          <div class="say-table-tooltip--actions">
            {{#each row as |action|}}
              {{#if (isTitledAction action)}}
                <button
                  type="button"
                  title={{action.title}}
                  disabled={{not (this.canExecuteAction action)}}
                  {{on "click" (fn this.executeAction action)}}
                >
                  {{#if action.icon}}
                    <AuIcon @icon={{action.icon}} @size="large" />
                  {{/if}}
                  {{#if action.label}}
                    <span>{{action.label}}</span>
                  {{/if}}
                </button>
              {{else}}
                <action.component @controller={{this.controller}} />
              {{/if}}
            {{/each}}
          </div>
        {{/each}}
      </SelectionTooltip>
    </div>
  </template>
}
