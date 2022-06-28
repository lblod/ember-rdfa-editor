import Model from '@lblod/ember-rdfa-editor/model/model';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '../model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

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
    if (range.collapsed) {
      if (direction === 'left') {
        const newStart = range.start.shiftedVisually(-1);
        const newEnd = range.start;
        const removeRange = new ModelRange(newStart, newEnd);
        this.model.change((mutator) => {
          const newRange = mutator.removeNodes(removeRange);
          this.model.selectRange(newRange);
        });
      } else if (direction === 'right') {
        const newEnd = range.start.shiftedVisually(1);
        const newStart = range.start;
        const removeRange = new ModelRange(newStart, newEnd);
        this.model.change((mutator) => {
          const newRange = mutator.removeNodes(removeRange);
          this.model.selectRange(newRange);
        });
      }
    } else {
      this.model.change((mutator) => {
        const newRange = mutator.removeNodes(range);
        this.model.selectRange(newRange);
      });
    }
  }
}
