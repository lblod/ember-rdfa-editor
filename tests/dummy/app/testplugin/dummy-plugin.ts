import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';

export default class DummyPlugin implements EditorPlugin {
  private controller!: Controller;

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: Controller): Promise<void> {
    this.controller = controller;
    this.controller.onEvent('contentChanged', () => {
      for (const mark of this.controller.ownMarks) {
        this.controller.executeCommand('remove-mark', mark);
      }

      const walker = GenTreeWalker.fromSubTree({
        root: this.controller.modelRoot,
        filter: toFilterSkipFalse(
          (node) =>
            ModelNode.isModelText(node) && node.content.search('yeet') > -1
        ),
      });
      for (const node of walker.nodes()) {
        this.controller?.executeCommand(
          'add-mark-to-range',
          this.controller?.rangeFactory.fromAroundNode(node),
          'highlighted',
          { setBy: this.name }
        );
      }
    });
  }

  get name(): string {
    return 'dummy';
  }
}
