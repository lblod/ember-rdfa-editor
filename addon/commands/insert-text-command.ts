import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '../model/model-element';
import { logExecute } from '../utils/logging-utils';
import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';

export default class InsertTextCommand extends Command {
  name = 'insert-text';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(
    text: string,
    range: ModelRange | null = this.model.selection.lastRange,
    marks: MarkSet = range === this.model.selection.lastRange
      ? this.model.selection.activeMarks
      : range?.getMarks() || new MarkSet()
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
          resultRange = mutator.insertText(resultRange, line, marks);
          resultRange.collapse(false);
          resultRange = mutator.insertNodes(
            resultRange,
            new ModelElement('br')
          );
          resultRange.collapse(false);
          previousIndex = position + 1;
        }
        const lastLine = text.substring(previousIndex, text.length);
        resultRange = mutator.insertText(resultRange, lastLine, marks);
      } else {
        resultRange = mutator.insertText(range, text, marks);
      }
      resultRange.collapse(false);
      this.model.selectRange(resultRange);
    });
  }
}
