import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class RemoveMarkCommand extends Command<
  [ModelRange, string, Record<string, unknown> | void],
  void
> {
  name = 'remove-mark';

  constructor(model: Model) {
    super(model);
  }

  execute(range: ModelRange, markName: string): void {
    console.assert(this.model.rootModelNode === range.root, 'root not same');
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      this.model.change((mutator) => {
        const resultRange = mutator.removeMark(
          range,
          spec,
          this.model.marksRegistry
        );
        this.model.selectRange(resultRange);
      });
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
