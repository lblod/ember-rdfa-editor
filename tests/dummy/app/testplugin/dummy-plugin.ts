import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';

export interface DummyPluginOptions {
  testKey: string;
}

export default class DummyPlugin implements EditorPlugin {
  controller!: Controller;
  private logger: Logger = createLogger(this.constructor.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(
    controller: Controller,
    options: DummyPluginOptions
  ): Promise<void> {
    this.logger('recieved options: ', options);
    this.controller = controller;
    this.controller.addTransactionStepListener((tr) => {
      for (const mark of this.controller.ownMarks) {
        tr.commands.removeMark({ mark });
      }

      const walker = GenTreeWalker.fromSubTree({
        root: this.controller.modelRoot,
        filter: toFilterSkipFalse(
          (node) =>
            ModelNode.isModelText(node) && node.content.search('yeet') > -1
        ),
      });
      for (const node of walker.nodes()) {
        tr.commands.addMarkToRange({
          range: this.controller?.rangeFactory.fromAroundNode(node),
          markName: 'highlighted',
          markAttributes: { setBy: this.name },
        });
      }
    });
  }

  get name(): string {
    return 'dummy';
  }
}
