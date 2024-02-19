import Component from '@glimmer/component';
import { Command, SayController } from '@lblod/ember-rdfa-editor';
import SelectionTooltip from '../../_private/selection-tooltip';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
} from 'prosemirror-tables';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller: SayController;
};

type Action = {
  title: string;
  icon: string;
  command: Command;
};
export default class TableTooltip extends Component<Args> {
  @service declare intl: IntlService;

  SelectionTooltip = SelectionTooltip;

  @tracked _justClicked = false;

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

  get tableActions(): Action[] {
    return [
      {
        title: this.intl.t('ember-rdfa-editor.add-row-below'),
        icon: 'table-row-end-add',
        command: addRowAfter,
      },
      {
        title: this.intl.t('ember-rdfa-editor.add-row-above'),
        icon: 'table-row-start-add',
        command: addRowBefore,
      },
      {
        title: this.intl.t('ember-rdfa-editor.add-column-after'),
        icon: 'table-column-end-add',
        command: addColumnAfter,
      },
      {
        title: this.intl.t('ember-rdfa-editor.add-column-before'),
        icon: 'table-column-start-add',
        command: addColumnBefore,
      },
      {
        title: this.intl.t('ember-rdfa-editor.delete-row'),
        icon: 'table-row-remove',
        command: deleteRow,
      },
      {
        title: this.intl.t('ember-rdfa-editor.delete-column'),
        icon: 'table-column-remove',
        command: deleteColumn,
      },
      {
        title: this.intl.t('ember-rdfa-editor.delete-table'),
        icon: 'bin',
        command: deleteTable,
      }
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
    return this.controller.checkCommand(action.command);
  };

  @action
  executeAction(action: Action) {
    this.controller.focus();
    this.controller.doCommand(action.command);
  }
}
