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
    this.args.controller.addTransactionStepListener(this.update.bind(this));
  }

  @action
  willDestroy(): void {
    this.args.controller.removeTransactionStepListener(this.update.bind(this));
    super.willDestroy();
  }

  get controller() {
    return this.args.controller;
  }

  modifiesSelection(steps: Step[]) {
    return steps.some((step) => isSelectionStep(step) || isOperationStep(step));
  }

  update(transaction: Transaction, steps: Step[]) {
    if (this.modifiesSelection(steps)) {
      this.updateProperties(transaction);
    }
  }

  updateProperties(transaction: Transaction) {
    const { currentSelection: selection } = transaction;
    console.log('CODE-MARK', selection.hasMark('code-mark'));
    this.isCode = selection.hasMark('code-mark');
  }
  @action
  toggleCode() {
    if (!this.isCode) {
      console.log('ADD CODE MARK');
      this.args.controller.perform((tr) => {
        tr.commands.addMarkToSelection({
          markName: 'code-mark',
          markAttributes: {},
        });
      });
    } else {
      console.log('REMOVE CODE MARK');

      this.args.controller.perform((tr) => {
        tr.commands.removeMarkFromSelection({
          markName: 'code-mark',
          markAttributes: {},
        });
      });
    }
  }
}
