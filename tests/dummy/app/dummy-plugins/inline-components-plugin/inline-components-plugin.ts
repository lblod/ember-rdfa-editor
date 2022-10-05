import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import CounterSpec from '../inline-components-plugin/models/inline-components/counter';
import DropdownSpec from '../inline-components-plugin/models/inline-components/dropdown';

export default class InlineComponentsPlugin implements EditorPlugin {
  controller!: Controller;

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(
    transaction: Transaction,
    controller: Controller
  ): Promise<void> {
    this.controller = controller;

    transaction.registerWidget(
      {
        componentName: 'inline-components-plugin/rdfa-ic-plugin-insert',
        desiredLocation: 'insertSidebar',
      },
      controller
    );
    transaction.registerInlineComponent(new CounterSpec(this.controller));
    transaction.registerInlineComponent(new DropdownSpec(this.controller));
  }

  get name(): string {
    return 'inline-components';
  }
}
