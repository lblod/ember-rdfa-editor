import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import SelectionTooltip from '../../_private/selection-tooltip.ts';
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
import ColorMenu from '#root/components/plugins/table/color.ts';
import type { ComponentLike } from '@glint/template';
import VerticalAlign from '#root/components/plugins/table/vertical-align.ts';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { TableColumnEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-end-add';
import { TableColumnStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-start-add';
import { TableColumnRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-column-remove';
import { TableRowEndAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-end-add';
import { TableRowStartAddIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-start-add';
import { TableRowRemoveIcon } from '@appuniversum/ember-appuniversum/components/icons/table-row-remove';
import type SayController from '#root/core/say-controller.ts';
import type { Command } from 'prosemirror-state';

type Args = {
  controller: SayController;
};

type Action =
  | { title: string; icon?: ComponentLike; label?: string; command: Command }
  | { component: ComponentLike };

export default class TableTooltip extends Component<Args> {
  @service declare intl: IntlService;

  SelectionTooltip = SelectionTooltip;

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
}
