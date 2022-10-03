import Component from '@glimmer/component';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { ActiveComponentEntry } from '@lblod/ember-rdfa-editor/core/model/inline-components/inline-components-registry';
import { ModelInlineComponent } from '@lblod/ember-rdfa-editor/core/model/inline-components/model-inline-component';
import { tracked } from '@glimmer/tracking';
import { isOperationStep } from '@lblod/ember-rdfa-editor/core/state/steps/step';
import { action } from '@ember/object';

interface InlineComponentManagerArgs {
  controller: Controller;
}

export default class InlineComponentManager extends Component<InlineComponentManagerArgs> {
  @tracked inlineComponents: ActiveComponentEntry[] = [];

  @action
  didInsert() {
    this.args.controller.addTransactionDispatchListener(
      this.updateInlineComponents.bind(this)
    );
    this.refreshInlineComponents();
  }

  @action
  willDestroy(): void {
    this.args.controller.removeTransactionDispatchListener(
      this.updateInlineComponents.bind(this)
    );
    super.willDestroy();
  }

  updateInlineComponents(transaction: Transaction) {
    if (transaction.steps.some((step) => isOperationStep(step))) {
      this.refreshInlineComponents();
    }
  }

  refreshInlineComponents() {
    const inlineComponentsMap =
      this.args.controller?.currentState.inlineComponentsRegistry
        .activeComponents ||
      new Map<ModelInlineComponent, ActiveComponentEntry>();
    this.inlineComponents = [...inlineComponentsMap.values()];
  }
}
