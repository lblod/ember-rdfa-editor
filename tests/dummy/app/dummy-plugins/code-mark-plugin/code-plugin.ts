import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import { codeMarkSpec } from './marks/code-mark';

export default class CodeMarkPlugin implements EditorPlugin {
  controller!: Controller;

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(
    transaction: Transaction,
    controller: Controller
  ): Promise<void> {
    this.controller = controller;

    transaction.registerWidget(
      {
        componentName: 'code-mark-plugin/toolbar-button',
        desiredLocation: 'toolbarMiddle',
      },
      controller
    );
    transaction.registerMark(codeMarkSpec);
  }

  get name(): string {
    return 'code-mark';
  }
}
