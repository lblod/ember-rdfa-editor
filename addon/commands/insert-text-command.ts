import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '../core/model/nodes/model-element';
import { logExecute } from '../utils/logging-utils';
import { MarkSet } from '@lblod/ember-rdfa-editor/core/model/marks/mark';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertText: InsertTextCommand;
  }
}

export interface InsertTextCommandArgs {
  text: string;
  range: ModelRange | null;
  marks?: MarkSet;
  needsToWrite?: boolean;
}

export default class InsertTextCommand
  implements Command<InsertTextCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      text,
      range,
      marks = transaction.workingCopy.selection.lastRange &&
      range?.sameAs(transaction.workingCopy.selection.lastRange)
        ? transaction.workingCopy.selection.activeMarks
        : range?.getMarks() || new MarkSet(),
    }: InsertTextCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

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
      transaction.insertText({
        range: resultRange,
        text: lastLine,
        marks,
      });
    } else {
      transaction.insertText({ range, text, marks });
    }
    transaction.collapseSelection();
  }
}
