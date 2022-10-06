import { action } from '@ember/object';
import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import {
  isOperationStep,
  isSelectionStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import { tracked } from 'tracked-built-ins';

type Args = {
  controller: Controller;
};

export default class CodeMarkToolbarButton extends Component<Args> {
  @tracked isCode = false;

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
    const { currentSelection: selection } = transaction;
    this.isCode = selection.hasMark('code-mark');
  }
  @action
  toggleCode() {
    if (!this.isCode) {
      this.args.controller.perform((tr) => {
        tr.commands.addMarkToSelection({
          markName: 'code-mark',
          markAttributes: {},
        });
      });
    } else {
      this.args.controller.perform((tr) => {
        tr.commands.removeMarkFromSelection({
          markName: 'code-mark',
          markAttributes: {},
        });
      });
    }
  }
}
