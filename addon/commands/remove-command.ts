import Model from '@lblod/ember-rdfa-editor/model/model';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '../model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { MarkSet } from '../model/mark';

export default class RemoveCommand extends Command {
  name = 'remove';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(
    direction: 'left' | 'right',
    range: ModelRange | null = this.model.selection.lastRange
  ) {
    if (!range) {
      return;
    }
    let removeRange = range;
    if (range.collapsed) {
      if (direction === 'left') {
        const newStart = range.start.shiftedVisually(-1);
        const newEnd = range.start;
        removeRange = new ModelRange(newStart, newEnd);
      } else if (direction === 'right') {
        const newEnd = range.start.shiftedVisually(1);
        const newStart = range.start;
        removeRange = new ModelRange(newStart, newEnd);
      }
    }
    this.model.change((mutator) => {
      const newRange = mutator.removeNodes(removeRange);
      this.model.selectRange(newRange);
      if (newRange.start.parent.length === 0) {
        const finalRange = mutator.insertText(newRange, '', new MarkSet());
        this.model.selectRange(finalRange);
      }
    });
  }
}
