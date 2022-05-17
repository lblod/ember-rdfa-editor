import Command, {
    CommandContext
} from '@lblod/ember-rdfa-editor/commands/command';
import { Serializable } from '@lblod/ember-rdfa-editor/model/mark';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';

export interface AddMarkToRangeCommandArgs {
  range: ModelRange;
  markName: string;
  markAttributes?: Record<string, Serializable>;
}
export default class AddMarkToRangeCommand
  implements Command<AddMarkToRangeCommandArgs, void>
{
  name = 'add-mark-to-range';

  canExecute(): boolean {
    return true;
  }

  execute(
    { state, dispatch }: CommandContext,
    { range, markName, markAttributes = {} }: AddMarkToRangeCommandArgs
  ): void {
    const spec = state.marksRegistry.lookupMark(markName);
    const tr = state.createTransaction();
    if (spec) {
      const resultRange = tr.addMark(range, spec, markAttributes);
      tr.selectRange(resultRange);
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
    dispatch(tr);
  }
}
