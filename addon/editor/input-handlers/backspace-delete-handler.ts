import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { InputHandler } from './input-handler';

export default abstract class BackspaceDeleteHandler extends InputHandler {
  abstract direction: number;
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  handleEvent(_: KeyboardEvent) {
    let range = this.rawEditor.selection.lastRange;
    if (range) {
      if (range.collapsed) {
        const shifted = range.start.shiftedVisually(this.direction);
        range =
          this.direction === -1
            ? new ModelRange(shifted, range.start)
            : new ModelRange(range.start, shifted);
        const walker = GenTreeWalker.fromRange({
          range: range,
          reverse: this.direction === -1,
        });
        const nodes = [...walker.nodes()];
        if (
          ArrayUtils.all(
            nodes,
            (node) =>
              ModelNode.isModelElement(node) &&
              !node.getRdfaAttributes().isEmpty
          )
        ) {
          this.rawEditor.model.change(() => {
            this.rawEditor.model.selectRange(new ModelRange(shifted));
          });
        } else {
          this.rawEditor.executeCommand('remove', range);
        }
      } else {
        this.rawEditor.executeCommand('remove', range);
      }
    }

    return { allowPropagation: true, allowBrowserDefault: false };
  }
}
