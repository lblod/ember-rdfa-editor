import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { AttributeSpec } from '../utils/render-spec';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeMarkFromRange: RemoveMarkFromRangeCommand;
  }
}
export interface RemoveMarkFromRangeCommandArgs {
  range: ModelRange;
  markName: string;
  attributes: AttributeSpec;
}

export default class RemoveMarkFromRangeCommand
  implements Command<RemoveMarkFromRangeCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { range, markName, attributes }: RemoveMarkFromRangeCommandArgs
  ): void {
    const spec = transaction.workingCopy.marksRegistry.lookupMark(markName);
    if (spec) {
      transaction.removeMark(range, spec, attributes);
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
