import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import {
  ImpossibleModelStateError,
  MisbehavedSelectionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelElement from '../model/model-element';
import Command, { CommandContext } from './command';
export interface InsertNewLineCommandArgs {
  range?: ModelRange | null;
}

/**
 * Insert a newline at the cursor position. Is responsible for making sure
 * that newline renders correctly. Newlines are currently done using <br> elements, but
 * that is technically an implementation detail.
 */
export default class InsertNewLineCommand
  implements Command<InsertNewLineCommandArgs, void>
{
  name = 'insert-newLine';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { range = state.selection.lastRange }: InsertNewLineCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const br = new ModelElement('br');
    const tr = state.createTransaction();
    const nodeBefore = range.start.nodeBefore();
    // If we have a text node with a singe invisible space before us, extend the range
    // so it will be overwritten (this is mainly to clean up after ourselves).
    if (
      ModelNode.isModelText(nodeBefore) &&
      nodeBefore.content === INVISIBLE_SPACE
    ) {
      range.start = ModelPosition.fromBeforeNode(nodeBefore);
    }

    tr.insertNodes(range, br);
    const cursorPos = ModelPosition.fromAfterNode(br);
    let newRange = new ModelRange(cursorPos, cursorPos);

    if (!br.parent) {
      throw new ImpossibleModelStateError();
    }

    // If the br is the last child of a block element, it won't render properly.
    // Thanks to the magic of the dom spec, so we insert a good old invisible space.
    if (br.parent.isBlock && br === br.parent.lastChild) {
      const dummyText = new ModelText(INVISIBLE_SPACE);
      newRange = tr.insertNodes(newRange, dummyText);
    }

    tr.selectRange(newRange);
    dispatch(tr);
  }
}
