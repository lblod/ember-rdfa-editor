import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { Serializable } from '../model/util/render-spec';

export interface AddMarkToRangeCommandArgs {
  range: ModelRange;
  markName: string;
  markAttributes?: Record<string, Serializable>;
}
export default class AddMarkToRangeCommand
  implements Command<AddMarkToRangeCommandArgs, void>
{
  name = 'add-mark-to-range';
  arguments = ['range', 'markName', 'markAttributes'];

  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { range, markName, markAttributes = {} }: AddMarkToRangeCommandArgs
  ): void {
    const spec = transaction.workingCopy.marksRegistry.lookupMark(markName);
    if (spec) {
      const resultRange = transaction.addMark(range, spec, markAttributes);
      transaction.selectRange(resultRange);
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
