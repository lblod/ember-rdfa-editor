import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/model/mark';

export default class RemoveMarkFromRangeCommand extends Command<
  [ModelRange, string, Record<string, unknown> | void],
  void
> {
  name = 'remove-mark-from-range';

  constructor(model: Model) {
    super(model);
  }

  execute(
    range: ModelRange,
    markName: string,
    attributes: AttributeSpec
  ): void {
    console.assert(this.model.rootModelNode === range.root, 'root not same');
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      this.model.change((mutator) => {
        const resultRange = mutator.removeMark(range, spec, attributes);
        this.model.selectRange(resultRange);
      });
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
