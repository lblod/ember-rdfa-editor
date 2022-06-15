import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec } from '../model/util/render-spec';

export interface RemoveMarkFromRangeCommandArgs {
  range: ModelRange;
  markName: string;
  attributes: AttributeSpec;
}
export default class RemoveMarkFromRangeCommand
  implements Command<RemoveMarkFromRangeCommandArgs, void>
{
  name = 'remove-mark-from-range';
  arguments: string[] = ['range', 'markName', 'attributes'];
  canExecute(): boolean {
    return true;
  }

  execute(
    { state, dispatch }: CommandContext,
    { range, markName, attributes }: RemoveMarkFromRangeCommandArgs
  ): void {
    const tr = state.createTransaction();
    const spec = state.marksRegistry.lookupMark(markName);
    if (spec) {
      tr.removeMark(range, spec, attributes);
      dispatch(tr);
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
