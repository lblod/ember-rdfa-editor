import Command from '@lblod/ember-rdfa-editor/commands/command';
import { Mark } from '@lblod/ember-rdfa-editor/model/markSpec';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';

export default class AddMarkCommand extends Command<
  [ModelRange, string],
  void
> {
  name = 'add-mark';

  constructor(model: Model) {
    super(model);
  }

  execute(
    range: ModelRange,
    markName: string,
    markAttributes: Record<string, unknown> = {}
  ): void {
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      this.model.change((mutator) => {
        const resultRange = mutator.addMark(
          range,
          new Mark(spec, markAttributes)
        );
        this.model.selectRange(resultRange);
      });
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
