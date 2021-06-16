import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelElement from "../model/model-element";
import {ImpossibleModelStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";


/**
 * Insert a newline at the cursor position. Is responsible for making sure
 * that newline renders correctly. Newlines are currently done using <br> elements, but
 * that is technically an implementation detail.
 */
export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if(!range) {
      throw new MisbehavedSelectionError();
    }
    const br = new ModelElement("br");
    this.model.change(mutator => {

      const nodeBefore = range.start.nodeBefore();
      // if we have a textnode with a singe invis space before us, extend the range
      // so it will be overwritten (this is mainly to clean up after ourselves)
      if (ModelNode.isModelText(nodeBefore) && nodeBefore.content === INVISIBLE_SPACE) {
        range.start = ModelPosition.fromBeforeNode(nodeBefore);
      }

      mutator.insertNodes(range, br);

      const cursorPos = ModelPosition.fromAfterNode(br);
      let newRange = new ModelRange(cursorPos, cursorPos);

      if(!br.parent ) {
        throw new ImpossibleModelStateError();
      }
      // if the br is the last child of a block element, it won't render properly
      // thanks to the magic of the dom spec, so we insert a good old invisible space
      if(br.parent.isBlock && br === br.parent.lastChild) {
        const dummyText = new ModelText(INVISIBLE_SPACE);
        newRange = mutator.insertNodes(newRange, dummyText);
      }
      this.model.selectRange(newRange);
    });
  }
}
