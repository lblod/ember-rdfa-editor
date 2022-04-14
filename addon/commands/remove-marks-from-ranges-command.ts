import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/model/mark';

interface MarkConfig {
  name: string;
  attributes: AttributeSpec;
}

export interface RemoveMarkFromRangeArgs {
  ranges: Iterable<ModelRange>;
  markConfigs: Iterable<MarkConfig>;
}

export default class RemoveMarksFromRangesCommand extends Command<
  [RemoveMarkFromRangeArgs],
  void
> {
  name = 'remove-marks-from-ranges';

  constructor(model: Model) {
    super(model);
  }

  execute({ ranges, markConfigs }: RemoveMarkFromRangeArgs): void {
    this.model.change((mutator) => {
      for (const { name, attributes } of markConfigs) {
        const spec = this.model.marksRegistry.lookupMark(name);
        if (spec) {
          for (const range of ranges) {
            mutator.removeMark(range, spec, attributes);
          }
        } else {
          throw new ModelError(`Unrecognized mark: ${name}`);
        }
      }
    });
  }
}
