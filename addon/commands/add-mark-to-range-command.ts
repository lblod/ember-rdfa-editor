import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { Serializable } from '../model/util/render-spec';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    addMarkToRange: AddMarkToRangeCommand;
  }
}
export interface AddMarkToRangeCommandArgs {
  range: ModelRange;
  markName: string;
  markAttributes?: Record<string, Serializable>;
}

export default class AddMarkToRangeCommand
  implements Command<AddMarkToRangeCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { range, markName, markAttributes = {} }: AddMarkToRangeCommandArgs
  ): void {
    const spec = transaction.workingCopy.marksRegistry.lookupMark(markName);
    if (spec) {
      transaction.addMark(range, spec, markAttributes);
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
