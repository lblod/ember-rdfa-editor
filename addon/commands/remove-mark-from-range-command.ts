import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { AttributeSpec } from '../model/util/render-spec';

export default class RemoveMarkFromRangeCommand extends Command<
  [ModelRange, string, AttributeSpec],
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
        mutator.removeMark(range, spec, attributes);
      });
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
