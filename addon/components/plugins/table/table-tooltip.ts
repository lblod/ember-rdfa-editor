import Component from '@glimmer/component';
import { type Command, SayController } from '@lblod/ember-rdfa-editor';
import { htmlSafe } from '@ember/template';
import SelectionTooltip from '../../_private/selection-tooltip';
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
import IntlService from 'ember-intl/services/intl';
import ColorMenu from '@lblod/ember-rdfa-editor/components/plugins/table/color';
import type { ComponentLike } from '@glint/template';
import VerticalAlign from '@lblod/ember-rdfa-editor/components/plugins/table/vertical-align';

type Args = {
  controller: SayController;
};

type Action =
  | { title: string; icon?: string; label?: string; command: Command }
  | { component: ComponentLike };

export default class TableTooltip extends Component<Args> {
  @service declare intl: IntlService;

  SelectionTooltip = SelectionTooltip;

  @tracked _justClicked = false;

  htmlSafe = htmlSafe;

  setUpListeners = modifier(
    () => {
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
    },
    { eager: false },
  );

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
          icon: 'table-row-end-add',
          command: addRowAfter,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-row-above'),
          icon: 'table-row-start-add',
          command: addRowBefore,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-column-after'),
          icon: 'table-column-end-add',
          command: addColumnAfter,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.add-column-before'),
          icon: 'table-column-start-add',
          command: addColumnBefore,
        },
      ],
      [
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-row'),
          icon: 'table-row-remove',
          command: deleteRow,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-column'),
          icon: 'table-column-remove',
          command: deleteColumn,
        },
        {
          title: this.intl.t('ember-rdfa-editor.table.delete-table'),
          icon: 'bin',
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
