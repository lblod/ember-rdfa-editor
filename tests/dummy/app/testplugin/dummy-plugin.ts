import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import CounterSpec from './models/inline-components/counter';
import DropdownSpec from './models/inline-components/dropdown';

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
      for (const { mark, node } of this.controller.ownMarks) {
        tr.commands.removeMarkFromNode({ mark, node });
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

    controller.registerWidget({
      componentName: 'rdfa-ic-plugin-insert',
      desiredLocation: 'insertSidebar',
    });
    controller.registerInlineComponent(new CounterSpec(this.controller));
    controller.registerInlineComponent(new DropdownSpec(this.controller));
  }

  get name(): string {
    return 'dummy';
  }
}
