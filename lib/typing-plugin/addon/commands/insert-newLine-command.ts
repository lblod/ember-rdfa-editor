import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {ImpossibleModelStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/util/errors";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";

/**
 * Insert a newline at the cursor position. Is responsible for making sure
 * that newline renders correctly. Newlines are currently done using <br> elements, but
 * that is technically an implementation detail.
 */
export default class InsertNewLineCommand extends Command<[ModelRange | null], void> {
  name = "insert-newLine";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const br = new ModelElement("br");
    this.model.change(executedBy, mutator => {
      const nodeBefore = range.start.nodeBefore();
      // If we have a text node with a singe invisible space before us, extend the range
      // so it will be overwritten (this is mainly to clean up after ourselves).
      if (ModelNode.isModelText(nodeBefore) && nodeBefore.content === INVISIBLE_SPACE) {
        range.start = ModelPosition.fromBeforeNode(nodeBefore);
      }

      mutator.insertNodes(range, br);
      const cursorPos = ModelPosition.fromAfterNode(br);
      let newRange = new ModelRange(cursorPos, cursorPos);

      if (!br.parent) {
        throw new ImpossibleModelStateError();
      }

      // If the br is the last child of a block element, it won't render properly.
      // Thanks to the magic of the dom spec, so we insert a good old invisible space.
      if (br.parent.isBlock && br === br.parent.lastChild) {
        const dummyText = new ModelText(INVISIBLE_SPACE);
        newRange = mutator.insertNodes(newRange, dummyText);
      }

      this.model.selection.selectRange(newRange);
    });
  }
}
