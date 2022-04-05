import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '../model/model-element';
import { logExecute } from '../utils/logging-utils';

export default class InsertTextCommand extends Command {
  name = 'insert-text';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(
    text: string,
    range: ModelRange | null = this.model.selection.lastRange
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const newLines = text.matchAll(/\n/g);
    this.model.change((mutator) => {
      let resultRange = range;
      if (newLines) {
        let previousIndex = 0;
        for (const newLineMatch of newLines) {
          const position = newLineMatch.index!;
          const line = text.substring(previousIndex, position);
          resultRange = mutator.insertText(resultRange, line);
          resultRange.collapse(false);
          resultRange = mutator.insertNodes(
            resultRange,
            new ModelElement('br')
          );
          resultRange.collapse(false);
          previousIndex = position + 1;
        }
        const lastLine = text.substring(previousIndex, text.length);
        resultRange = mutator.insertText(resultRange, lastLine);
      } else {
        resultRange = mutator.insertText(range, text);
      }
      resultRange.collapse(false);
      this.model.selectRange(resultRange);
    });
  }
}
