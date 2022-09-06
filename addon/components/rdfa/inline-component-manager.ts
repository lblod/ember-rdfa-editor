import Component from '@glimmer/component';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { ActiveComponentEntry } from '@lblod/ember-rdfa-editor/model/inline-components/inline-components-registry';
import { ModelInlineComponent } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { tracked } from '@glimmer/tracking';
import { isOperationStep } from '@lblod/ember-rdfa-editor/core/steps/step';

interface InlineComponentManagerArgs {
  controller: Controller;
}

export default class InlineComponentManager extends Component<InlineComponentManagerArgs> {
  @tracked inlineComponents: ActiveComponentEntry[] = [];
  constructor(parent: unknown, args: InlineComponentManagerArgs) {
    super(parent, args);
    this.args.controller.addTransactionDispatchListener(
      this.updateInlineComponents.bind(this)
    );
  }

  updateInlineComponents(transaction: Transaction) {
    if (transaction.steps.some((step) => isOperationStep(step))) {
      const inlineComponentsMap =
        this.args.controller?.currentState.inlineComponentsRegistry
          .activeComponents ||
        new Map<ModelInlineComponent, ActiveComponentEntry>();
      this.inlineComponents = [...inlineComponentsMap.values()];
    }
  }
}
