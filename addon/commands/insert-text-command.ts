import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '../model/model-element';
import { logExecute } from '../utils/logging-utils';
import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';

export interface InsertTextCommandArgs {
  text: string;
  range: ModelRange | null;
  marks?: MarkSet;
  needsToWrite?: boolean;
}

export default class InsertTextCommand
  implements Command<InsertTextCommandArgs, void>
{
  name = 'insert-text';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { dispatch, state }: CommandContext,
    {
      text,
      marks = new MarkSet(),
      range,
      needsToWrite = true,
    }: InsertTextCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    const transaction = state.createTransaction();

    const newLines = text.matchAll(/\n/g);
    let resultRange = range;
    if (newLines) {
      let previousIndex = 0;
      for (const newLineMatch of newLines) {
        const position = newLineMatch.index!;
        const line = text.substring(previousIndex, position);
        resultRange = transaction.insertText({
          range: resultRange,
          text: line,
          marks,
        });
        resultRange.collapse(false);
        resultRange = transaction.insertNodes(
          resultRange,
          new ModelElement('br')
        );
        resultRange.collapse(false);
        previousIndex = position + 1;
      }
      const lastLine = text.substring(previousIndex, text.length);
      resultRange = transaction.insertText({
        range: resultRange,
        text: lastLine,
        marks,
      });
    } else {
      resultRange = transaction.insertText({ range, text, marks });
    }
    resultRange.collapse(false);
    transaction.selectRange(resultRange);
    transaction.needsToWrite = needsToWrite;
    dispatch(transaction);
  }
}
