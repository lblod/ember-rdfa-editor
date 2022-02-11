import Command from '@lblod/ember-rdfa-editor/commands/command';
import { Serializable } from '@lblod/ember-rdfa-editor/model/mark';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';

export default class AddMarkToRangeCommand extends Command<
  [ModelRange, string],
  void
> {
  name = 'add-mark-to-range';

  constructor(model: Model) {
    super(model);
  }

  execute(
    range: ModelRange,
    markName: string,
    markAttributes: Record<string, Serializable> = {}
  ): void {
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      this.model.change((mutator) => {
        mutator.addMark(range, spec, markAttributes);
      });
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
