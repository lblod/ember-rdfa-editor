import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  isOperationStep,
  isSelectionStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { PropertyState } from '@lblod/ember-rdfa-editor/utils/types';

interface Args {
  showTextStyleButtons: boolean;
  showListButtons: boolean;
  showIndentButtons: boolean;
  controller: Controller;
}

/**
 * RDFa editor toolbar component
 * @module rdfa-editor
 * @class RdfaEditorToolbarComponent
 * @extends Component
 */
export default class EditorToolbar extends Component<Args> {
  @tracked isBold = false;
  @tracked isItalic = false;
  @tracked isStrikethrough = false;
  @tracked isUnderline = false;
  @tracked isInList = false;
  @tracked canInsertList = true;
  @tracked isInTable = false;
  @tracked canIndent = false;
  @tracked canUnindent = false;
  @tracked tableAddRows = 2;
  @tracked tableAddColumns = 2;
  selection: ModelSelection | null = null;

  @action
  didInsert() {
    this.args.controller.addTransactionDispatchListener(this.update);
  }

  @action
  willDestroy(): void {
    this.args.controller.removeTransactionDispatchListener(this.update);
    super.willDestroy();
  }

  get controller() {
    return this.args.controller;
  }

  modifiesSelection(steps: Step[]) {
    return steps.some((step) => isSelectionStep(step) || isOperationStep(step));
  }

  update = (transaction: Transaction) => {
    if (this.modifiesSelection(transaction.steps)) {
      this.updateProperties(transaction);
    }
  };

  updateProperties(transaction: Transaction) {
    const {
      currentSelection: selection,
      commands: { makeList, indentList, unindentList },
    } = transaction;
    this.isBold = selection.bold === PropertyState.enabled;
    this.isItalic = selection.italic === PropertyState.enabled;
    this.isUnderline = selection.underline === PropertyState.enabled;
    this.isStrikethrough = selection.strikethrough === PropertyState.enabled;
    this.isInList = selection.inListState === PropertyState.enabled;
    this.canInsertList = makeList.canExecute({});
    this.isInTable = selection.inTableState === PropertyState.enabled;
    this.canIndent = this.isInList && indentList.canExecute({});
    this.canUnindent = this.isInList && unindentList.canExecute({});
    this.selection = selection;
  }

  @action
  insertIndent() {
    if (this.isInList) {
      this.args.controller.perform((tr) => tr.commands.indentList({}));
    }
  }

  @action
  insertUnindent() {
    if (this.isInList) {
      this.args.controller.perform((tr) => tr.commands.unindentList({}));
    }
  }

  @action
  insertNewLine() {
    this.controller.perform((tr) => tr.commands.insertNewLine({}));
  }

  @action
  insertNewLi() {
    this.controller.perform((tr) => tr.commands.insertNewLi({}));
  }

  @action
  toggleItalic() {
    this.setMark(!this.isItalic, 'italic');
  }

  @action
  toggleUnorderedList() {
    if (this.isInList) {
      this.controller.perform((tr) => tr.commands.removeList({}));
    } else {
      this.controller.perform((tr) => tr.commands.makeList({ listType: 'ul' }));
    }
  }

  @action
  toggleOrderedList() {
    if (this.isInList) {
      this.controller.perform((tr) => tr.commands.removeList({}));
    } else {
      this.controller.perform((tr) => tr.commands.makeList({ listType: 'ol' }));
    }
  }

  @action
  toggleBold() {
    this.setMark(!this.isBold, 'bold');
  }

  @action
  toggleUnderline() {
    this.setMark(!this.isUnderline, 'underline');
  }

  @action
  toggleStrikethrough() {
    this.setMark(!this.isStrikethrough, 'strikethrough');
  }

  @action
  setMark(value: boolean, markName: string, attributes = {}) {
    if (value) {
      this.controller.perform((tr: Transaction) => {
        tr.commands.addMarkToSelection({
          markName,
          markAttributes: attributes,
        });
        tr.focus();
      });
    } else {
      this.controller.perform((tr: Transaction) => {
        tr.commands.removeMarkFromSelection({
          markName,
          markAttributes: attributes,
        });
        tr.focus();
      });
    }
  }

  @action
  undo() {
    this.controller.perform((tr) => tr.commands.undo(undefined));
  }

  // Table commands
  @action
  insertTable() {
    this.tableAddRows = isNaN(this.tableAddRows) ? 2 : this.tableAddRows;
    this.tableAddColumns = isNaN(this.tableAddColumns)
      ? 2
      : this.tableAddColumns;
    this.tableAddRows = this.tableAddRows < 1 ? 1 : this.tableAddRows;
    this.tableAddColumns = this.tableAddColumns < 1 ? 1 : this.tableAddColumns;
    this.controller.perform((tr) =>
      tr.commands.insertTable({
        rows: this.tableAddRows,
        columns: this.tableAddColumns,
      })
    );
  }

  @action
  insertRowBelow() {
    this.controller.perform((tr) => tr.commands.insertTableRowBelow({}));
  }

  @action
  insertRowAbove() {
    this.controller.perform((tr) => tr.commands.insertTableRowAbove({}));
  }

  @action
  insertColumnAfter() {
    this.controller.perform((tr) => tr.commands.insertTableColumnAfter({}));
  }

  @action
  insertColumnBefore() {
    this.controller.perform((tr) => tr.commands.insertTableColumnBefore({}));
  }

  @action
  removeTableRow() {
    this.controller.perform((tr) => tr.commands.removeTableRow({}));
  }

  @action
  removeTableColumn() {
    this.controller.perform((tr) => tr.commands.removeTableColumn({}));
  }

  @action
  removeTable() {
    this.controller.perform((tr) => tr.commands.removeTable({}));
  }
}
