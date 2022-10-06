import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import {
  isOperationStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';

export interface HighlightPluginOptions {
  testKey: string;
}

export default class HighlightPlugin implements EditorPlugin {
  controller!: Controller;
  private logger: Logger = createLogger(this.constructor.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(
    transaction: Transaction,
    controller: Controller,
    options: HighlightPluginOptions
  ): Promise<void> {
    this.logger('received options: ', options);
    this.controller = controller;
    transaction.addTransactionStepListener(this.onTransactionStep);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async willDestroy(transaction: Transaction): Promise<void> {
    transaction.removeTransactionStepListener(this.onTransactionStep);
  }

  onTransactionStep = (transaction: Transaction, steps: Step[]) => {
    if (!steps.some(isOperationStep)) return;
    for (const { mark, node } of transaction
      .getMarksManager()
      .getMarksByOwner(this.name)) {
      transaction.commands.removeMarkFromNode({ mark, node });
    }

    const walker = GenTreeWalker.fromSubTree({
      root: transaction.currentDocument,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNode.isModelText(node) && node.content.search('test') > -1
      ),
    });
    for (const node of walker.nodes()) {
      transaction.commands.addMarkToRange({
        range: transaction.rangeFactory.fromAroundNode(node),
        markName: 'highlighted',
        markAttributes: { setBy: this.name },
      });
    }
  };

  get name(): string {
    return 'highlight';
  }
}
