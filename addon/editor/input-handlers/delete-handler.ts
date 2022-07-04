import { InputHandler } from './input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';

/**
 * EnterHandler, an event handler to handle the generic enter case.
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class DeleteHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === 'Delete';
  }

  handleEvent(_: KeyboardEvent) {
    const range = this.rawEditor.selection.lastRange;
    if (range) {
      const newStart = range.start;
      const newEnd = range.start.shiftedVisually(1);
      const removeRange = new ModelRange(newStart, newEnd);
      const nextNode = GenTreeWalker.fromRange({
        range: removeRange,
        filter: toFilterSkipFalse((node) => ModelNode.isModelElement(node)),
      }).nextNode();
      if (
        !ModelNode.isModelElement(nextNode) ||
        nextNode.getRdfaAttributes().isEmpty
      ) {
        this.rawEditor.executeCommand('remove', removeRange);
      } else {
        this.rawEditor.model.change(() => {
          this.rawEditor.model.selectRange(new ModelRange(newEnd));
        });
      }
    }
    return { allowPropagation: true, allowBrowserDefault: false };
  }
}
