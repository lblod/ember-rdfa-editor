import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
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

    this.model.change((mutator) => {
      const resultRange = mutator.insertText(range, text);

      resultRange.collapse(false);
      this.model.selectRange(resultRange);
    });
  }
}
