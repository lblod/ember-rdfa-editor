import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  isOperationStep,
  isSelectionStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { PropertyState } from '@lblod/ember-rdfa-editor/utils/types';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

interface Args {
  showTextStyleButtons: boolean;
  showListButtons: boolean;
  showIndentButtons: boolean;
  controller: ProseController;
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
  insertIndent() {}

  @action
  insertUnindent() {}

  @action
  insertNewLine() {}

  @action
  insertNewLi() {}

  @action
  toggleItalic() {
    this.setMark(!this.isItalic, 'italic');
  }

  @action
  toggleUnorderedList() {}

  @action
  toggleOrderedList() {}

  @action
  toggleBold() {
    this.controller.toggleMark('strong');
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
    } else {
    }
  }

  @action
  undo() {}

  // Table commands
  @action
  insertTable() {}

  @action
  insertRowBelow() {}

  @action
  insertRowAbove() {}

  @action
  insertColumnAfter() {}

  @action
  insertColumnBefore() {}

  @action
  removeTableRow() {}

  @action
  removeTableColumn() {}

  @action
  removeTable() {}
}
