import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec } from '../model/util/render-spec';

interface MarkConfig {
  name: string;
  attributes: AttributeSpec;
}

export interface RemoveMarkFromRangeArgs {
  ranges: Iterable<ModelRange>;
  markConfigs: Iterable<MarkConfig>;
}

export default class RemoveMarksFromRangesCommand
  implements Command<RemoveMarkFromRangeArgs, void>
{
  name = 'remove-marks-from-ranges';
  arguments: string[] = ['ranges', 'markConfigs'];

  canExecute(): boolean {
    return true;
  }
  execute(
    { state, dispatch }: CommandContext,
    { ranges, markConfigs }: RemoveMarkFromRangeArgs
  ): void {
    const tr = state.createTransaction();
    for (const { name, attributes } of markConfigs) {
      const spec = state.marksRegistry.lookupMark(name);
      if (spec) {
        for (const range of ranges) {
          tr.removeMark(range, spec, attributes);
        }
      } else {
        throw new ModelError(`Unrecognized mark: ${name}`);
      }
    }
    dispatch(tr);
  }
}
